#!/bin/bash
if test -f "/home/waddle/app_files/envs" then
  cp /home/waddle/app_files/envs /var/www/html/.cron_env
  sed 's/export\s//' /var/www/html/.cron_env > /var/www/html/.env
else
  printenv | sed 's/^\(.*\)$/export \1/g' | grep -E "^export SS" > /var/www/html/.cron_env
  printenv | sed 's/^\(.*\)$/export \1/g' | grep -E "^export SDLT_" >> /var/www/html/.cron_env
  sed -i 's/\(^export [A-Z_0-9]*=\)\(.*\)$/\1"\2"/' /var/www/html/.cron_env
fi
cron && php-fpm && chmod 755 /var/www/html/* && nginx -g 'daemon off;'