#!/bin/bash
printenv | sed 's/^\(.*\)$/export \1/g' | grep -E "^export SS" > /etc/cron_env
printenv | sed 's/^\(.*\)$/export \1/g' | grep -E "^export SDLT_" >> /etc/cron_env
cron && php-fpm && chmod 755 /var/www/html/* && nginx -g 'daemon off;'