#!/bin/bash

function usage ()
{
  echo -e "Usage: $0 -f <tag> -t <tag> -r <gitlab-base-url>\n"
  exit 1
}

while getopts ":f:t:r:p:" opt; do
    case "${opt}" in
        f)
            f=${OPTARG}
            from=$f
            ;;
        t)
            t=${OPTARG}
            to=$t
            ;;
        r)
            r=${OPTARG}
            repo=$r
            ;;
        *)
            usage
            ;;
    esac
done

if [ -z "${f}" ] || [ -z "${t}" ] || [ -z "${r}" ]; then
    usage
fi

function do_changelog ()
{
  echo -e "\n\n## CHANGESET $from - $to" >> CHANGELOG.md && git log --no-merges \
        $from...$to \
        --pretty=format:"* [View commit:]($repo/commit/%H) %s" \
        --reverse >> CHANGELOG.md
}

echo -e "Generating CHANGELOG for: $from - $to"

do_changelog
