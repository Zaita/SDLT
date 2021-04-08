#!/bin/bash
echo "Step 01 - Updating Container"
apt-get update
apt-get -y install libicu-dev wget git zip unzip
echo "Step 02 - Installing PHP Modules"
docker-php-ext-install intl
docker-php-ext-install mysqli
docker-php-ext-install pdo_mysql
COMPOSER_FILE=/var/www/html/composer.phar
if [ ! -f "$COMPOSER_FILE" ]; then
echo "Step 03 - Installing Composer"
chmod +x /var/www/html/docker/install_composer.sh
/var/www/html/docker/install_composer.sh
php composer.phar update
php composer.phar install
echo "Step 04 - Building Silverstripe Vendor Components"
php /var/www/html/vendor/silverstripe/framework/cli-script.php dev/build
echo "Step 05 - Hydrating Custom Configuration"
/var/www/html/vendor/bin/sake dev/tasks/HydrateCustomConfig
echo "Step 06 - Running SDLT Setup Tasks"
/var/www/html/vendor/bin/sake dev/tasks/SetupSDLTDataTask
else
echo "Skipping steps 03-06. Not required (from /docker/install_php.sh)"
fi
echo "Step 07 - Starting PHP"
chown -R www-data public
docker-php-entrypoint php-fpm
