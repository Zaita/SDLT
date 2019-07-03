#!/bin/bash
#
# Russell Michell 2018 <russellmichell@catalyst.net.nz>
#
# What is this?
# 
# Provides an indication of any security vulnerabilities in a project's composer and npm dependencies
 
errors_npm=0
errors_cmp=0
errors_ss=0

GREEN="$(tput setaf 2)"
RED="$(tput setaf 1)"
RESET="$(tput sgr0)"
 
# Check Composer packages
# Will print the output of `<TBC>` to stdout if problems are found, and will print "[FAIL]" and exit with non-zero.
# Otherwise, prints "[OK]" and exits 0
function check_composer()
{
    if [ ! -f ./composer.lock ]; then
        echo -e "\n${RED}composer.lock not found${RESET}"
        exit 1
    fi  

    cmd=$( /vagrant/vendor/bin/security-checker security:check /vagrant/composer.lock )

    if [ "$( echo $cmd | grep 'No packages' )" ]; then
        echo "${GREEN}No vulnerabilities found${RESET}"
    else
        echo "${RED}$cmd ${RESET}"
        errors_cmp=1
    fi  
}

# Check SilverStripe's Composer packages
# Will print the output of `./.tools/silverstripe-depcheck.py` to stdout if problems are found, and will print "[FAIL]" and exit with non-zero.
# Otherwise, prints "[OK]" and exits 0
function check_silverstripe()
{
    cmd=$( ./.tools/silverstripe-depcheck.py )

    if [[ "$?" -eq 0 ]]; then
        echo "${GREEN}All OK${RESET}"
    else
        echo "${RED}$cmd ${RESET}"
        errors_ss=1
    fi  
}
 
# Check NPM packages for each theme in this project
# Will print the output of `npm audit` to stdout if problems are found, and will print "[FAIL]" and exit with non-zero.
# Otherwise, prints "[OK]" and exits 0
function check_npm()
{
    # NPM: Where should we run the cmd?
    guard=$( find . -maxdepth 3 -name package.json | wc -l )

    if [[ $guard -eq 0 ]]; then
       echo "${RED}No package.json files found${RESET}"
       exit 1
    fi

    dirs=$( find . -maxdepth 3 -name package.json | cut -d'/' -f 2,3 | sed -e 's#/package.json##g' )
    start=$( pwd )

    for dir in $dirs; do
        cd $dir
        if [ "$( npm audit --dry-run | grep 'found 0' )" ]; then
            echo "${GREEN}OK${RESET}"
        else
            errors_npm=1
            echo "${RED}$dir${RESET}:"
            # "Retain" colours passed from `npm audit`
            npm audit --dry-run --production | \
                grep 'found' | \
                sed ''/moderate/s//`printf "\033[33mmoderate\033[0m"`/'; '/high/s//`printf "\033[31mhigh\033[0m"`/'; '/critical/s//`printf "\033[36mcritical\033[0m"`/''
        fi
     
        # Reset..
        cd $start
    done
}
 
echo "Checking project's composer deps..."
check_composer

echo "Checking SilverStripe security advisories against project deps..."
check_silverstripe

echo "Checking project's npm deps..."
check_npm
 
if [[ $errors_npm -eq 0 && $errors_cmp -eq 0 && $errors_ss -eq 0 ]]; then
    exit 0
else
    exit 1
fi

echo "$RESET"
