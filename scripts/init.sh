#!/bin/bash
#
# SilverStripe Team project init script: silverstripedev@catalyst.net.nz 2018
# Russell Michell 2018 <russellmichell@catalyst.net.nz>
#
# Whoop de-do Basil; but what does it do?
#
# 1). Writes the desired project name to the appropriate files
# 2). Installs some core packages

project=""
project_full_name=""
project_vcs_url=""
project_vcs_id=""
wr=""
version=""
packages="$( cat .packages )"
remove_public=""
rdbms=""
php_ver=""

# Show the user what the script flags are
function usage ()
{
  echo -e "Usage: $0 -n <Short Name> [ -f '<Full Name>' ] -g <VCS Url> -G <Gitlab ID> -w <WRMS ID> -d <mysql|postgres> -v <3|4> -p <5.6|7.0|7.1|7.2|7.3> -t abcd:1234 [ -r ]\n"
  exit 1
}

# Basic WRMS ID validator
function validate_wr ()
{
  if [ -z $( echo "$1" | grep -P '[0-9]{6}' ) ]; then
    usage
  fi
}

# Basic DB type validator
function validate_db ()
{
  if [ ! \( "$1" = 'mysql' -o "$1" = 'postgres' \) ]; then
    usage
  fi
}

# Basic PHP version validator
function validate_php ()
{
  if [ ! \( "$1" = '5.6' -o "$1" = '7.0' -o "$1" = '7.1' -o "$1" = '7.2' -o "$1" = '7.3' \) ]; then
    usage
  fi
}

# Basic project name validator
# devtools uses the same name for many things including Ubuntu username which has a username limit of 32 chars
# See: https://gitlab.wgtn.cat-it.co.nz/devtools/catalyst-vagrant/issues/82
function validate_project ()
{
  if [ "${#1}" -gt 14 ]; then
    usage
  fi  
}

while getopts "n:f:g:G:w:d:v:p:t:r" opt; do
    case "${opt}" in
        n)
            n=${OPTARG}
            validate_project "$n"
            project=$n
            ;;
        f)
            f=${OPTARG}
            project_full_name="$f"
            ;;
        g)
            g=${OPTARG}
            project_vcs_url="$g"
            ;;
        G)
            G=${OPTARG}
            project_vcs_id="$G"
            ;;
        w)
            w=${OPTARG}
            validate_wr "$w"
            wr=$w
            ;;
        d)
            d=${OPTARG}
            validate_db "$d"
            rdbms=$d
            ;;
        v)
            v=${OPTARG}
            version=$v
            ;;
        p)
            p=${OPTARG}
            validate_php $p
            php_ver=$p
            ;;
        t)
            t=${OPTARG}
            api_tokens="$t"
            ;;
        r)
            remove_public=1
            ;;
        *)
            usage
            ;;
    esac
done

if [ -z "$n" ] || [ -z "$f" ] || [ -z "$w" ] || [ -z "$v" ] || [ -z "$d" ] || [ -z "$g" ] || [ -z "$G" ] || [ -z "$t" ]; then
    usage
fi

# Update the project's name wherever it is mentioned (Vagrantfile, .gitlab-ci.yml etc)
function do_project_name ()
{
  echo -e "* Updating project name..."

  for file in $( find . -maxdepth 1 -path './.git' -prune -o -type f -not \( -name init.sh \) -print0 | xargs -0 ); do
    sed -i -e "s#site-myapp#$project#g" $file

    # SS3 v SS4 stuff
    if [[ "$file" == "./Vagrantfile" ]]; then
      sed -i -e "s#000000#$wr#g" $file

      if [[ "$version" -eq 3 ]]; then
        sed -i -e "s#silverstripe4#silverstripe#g" $file
      elif [[ "$version" -eq 4  && "$remove_public" -eq 1 ]]; then
        sed -i -e "s#remove_public=0#remove_public=1#g" $file
      fi
    fi

  done
}

# Update the current DB wherever it is required
function do_db ()
{
  # devtools default is to use postgres
  if [ "$rdbms" = 'mysql' ]; then
    sed -i -e "s#postgres#$rdbms#g" Vagrantfile
    sed -i -e "s#postgres#$rdbms#g" Vagrantfile.ci
  fi
}

# Update the current PHP version wherever it is required
function do_php ()
{
  # devtools default is to use O/S default
  os=$( cat /etc/lsb-release | grep CODENAME | awk -F= '{print $2}' )

  sed -i -e "s#php_ver=\"dummy\"#php_ver='$php_ver'#g" Vagrantfile
  sed -i -e "s#php_ver=\"dummy\"#php_ver='$php_ver'#g" Vagrantfile.ci
}

# Generate project-specific dashboard.json AND .tokens.json file
function do_dashboard()
{
  echo -e "* Generating dashboard.json ..."

  chmod +x ./scripts/dashboard.py && ./scripts/dashboard.py \
    -s "$project" \
    -f "$project_full_name" \
    -g "$project_vcs_url" \
    -i "$project_vcs_id" \
    -t "$api_tokens"
}

# Create a branch for all required project changes
function do_commit ()
{
  git checkout -b team/meta

  # Set global GIT config and write to file to insert into the VM
  git config core.filemode false
  git config user.name "$( git config --global --get user.name )"
  git config user.email "$( git config --global --get user.email )"
  git add . && git commit -an -m "TEAMINIT: WR#$wr Project is now Catalyst SilverStripe Team Approved"

  echo -e "\n* Doneburger!"
}

# Copy custom YML files in place
function do_yml_config ()
{
    project_dir=$( ls -l | grep app | awk '{print $9}' | tr -d '/' )

    if [ "$project_dir" = 'app' ]; then
        cp -r _config/*.yml app/_config/
    else
        cp -r _config/*.yml mysite/_config/
    fi

    rm -rf _config
}

# SS4 and -r not passed
if [[ "$version" -eq 4 && -z "${remove_public}" ]]; then
  mkdir public && mv index.ss4.php public/index.php
fi

# Don't do anything if we already have a "TEAMINIT" commit
if [[ "$( git log | grep 'TEAMINIT' )" ]]; then
  echo -e "This project has already been team-ified. Stopping!"
  exit 1
fi

do_project_name
do_db
do_php
do_dashboard
do_yml_config
do_commit
