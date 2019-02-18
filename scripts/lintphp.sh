#!/bin/bash
#
# Lints our custom PHP codebase according to PSR2
# Note: Restricted to "mysite" or "app" dirs only
# 
# Russell Michell 2018

dir=$( ls | grep -P '(mysite|app)' | awk '{print $NF}')
nochanges=$( git status | grep 'nothing to commit')

echo -e "Linting .php files with PSR2"

if [ "$nochanges" ]; then
  ./vendor/bin/php-cs-fixer fix "/vagrant/$dir" --rules=@PSR2 --verbose
  echo "PHPCS Fixer returned: $?"
  echo "Committing changes to VCS..."
  # Don't invoke grumphp
  git add . && git commit -an -m "TEAM: Linted with php-cs-fixer"
  echo -e "Done!"
else
  echo -e "[ERROR] You have changed files. Please stash or reset them"
  echo -e "Nothing to do"
fi
