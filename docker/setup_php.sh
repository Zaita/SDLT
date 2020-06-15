#!/bin/bash
apt-get update
apt-get -y install libicu-dev wget git zip unzip
docker-php-ext-install intl
docker-php-ext-install mysqli
docker-php-ext-install pdo_mysql
chmod +x /var/www/html/docker/install_composer.sh
/var/www/html/docker/install_composer.sh
php composer.phar install
php /var/www/html/vendor/silverstripe/framework/cli-script.php dev/build
/var/www/html/vendor/bin/sake dev/tasks/HydrateCustomConfig
/var/www/html/vendor/bin/sake dev/tasks/SetupSDLTDataTask
chown -R www-data public
docker-php-entrypoint php-fpm
