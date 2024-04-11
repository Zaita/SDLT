#!/bin/bash
printenv | sed 's/^\(.*\)$/export \1/g' | grep -E "^export SS" > /var/www/html/cron_env
printenv | sed 's/^\(.*\)$/export \1/g' | grep -E "^export SDLT_" >> /var/www/html/cron_env
sed -i 's/\(^export [A-Z_0-9]*=\)\(.*\)$/\1"\2"/' /var/www/html/cron_env
cron && php-fpm && chmod 755 /var/www/html/* && nginx -g 'daemon off;'