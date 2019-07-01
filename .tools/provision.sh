#!/bin/bash

# Add custom Vagrant post-provisioning here:
# Before adding anything, please ensure it cannot already be configured via devtools first

project_name=$1
remove_public=$2
wr=$3
rdbms=$4
# e.g. "5.6" or "7.3"
php_ver=$5

DEBIAN_FRONTEND='noninteractive' apt-get install -y nano libpython2.7-stdlib python-bs4 python-setuptools python-feedparser
DEBIAN_FRONTEND='noninteractive' apt-get install -y nodejs && npm install -g yarn
DEBIAN_FRONTEND='noninteractive' apt-get install -y python-pip && pip install --upgrade pip

function do_composer ()
{
  cd /vagrant && COMPOSER_HOME='/home/vagrant/' && composer install --no-interaction --no-suggest --prefer-source

  for dep in $( cat /vagrant/.packages ); do
    package="$( echo $dep | awk -F: '{print $2}' )"
    version="$( echo $dep | awk -F: '{print $3}' )"

    echo -e "* Installing $package ($version)..."
    
    if [ "$( echo $dep | awk -F: '{print $1}' )" = "dev-y" ]; then
      cd /vagrant && COMPOSER_HOME='/home/vagrant/' &&  composer require --dev --no-interaction --no-suggest --prefer-source $package $version
    else
      cd /vagrant && COMPOSER_HOME='/home/vagrant/' &&  composer require --no-interaction --no-suggest --prefer-source $package $version
    fi
  done

  # Modify any .htaccess files installed through `composer vendor-expose`
  for file in $( find /vagrant -type f -name '.htaccess' ); do
    sed -i -e 's#\^vendor#^(vendor|.tools)#g' "$file"
  done

  git add . && git commit -an -m "TEAMINIT: WR#$wr Added Catalyst SilverStripe Team Packages"
}

os=$( cat /etc/lsb-release | grep CODENAME | awk -F= '{print $2}' )
curr_ver=$( php -v | head -1 | sed 's#[^0-9.0-9]##g' | awk -F. '{print $1"."$2}' )

# If required, install an alternative PHP version as requested in the init script
# Here, at point of provisioning; we assume that whatever is passed to the function is correct (See checks in ./.tools/init.sh)  
function do_php ()
{
  php="php$php_ver"
  fpm="$php-fpm"
        
  # Stop the current php-fpm service before installing (and subsequently auto-configuring) the PPA alternative
  service "php$curr_ver-fpm" stop

  # 1). Add the plain ondrej PPA for PHP.
  # This gives us PHP & PHP-FPM for: 5.6, 7.0, 7.1, 7.2 & 7.3
  # add-apt-repository isn't unstalled on devtools-managed boxes so we do it manually
  echo "deb http://ppa.launchpad.net/ondrej/php/ubuntu $os main" > "/etc/apt/sources.list.d/ondrej-ubuntu-php-$os.list"

  apt-get update && DEBIAN_FRONTEND='noninteractive' apt-get install -y --allow-unauthenticated "$php" "$fpm"

  # 2). Install the desired PHP modules
  for ext in $( python .tools/phpexts.py -p $php_ver ); do
    DEBIAN_FRONTEND='noninteractive' apt-get install -y --allow-unauthenticated "php$php_ver-$ext"
  done

  # Replaces the automatic process presumably done by devtools itself
  ln -s "/var/run/php/$fpm.sock" "/var/run/silverstripe-site-$project_name.socket"

  # 3). Switch PHP version from whatever the default is
  update-alternatives --set php "/usr/bin/php$php_ver" && \
  update-alternatives --set php-config "/usr/bin/php-config$php_ver" && \
  update-alternatives --set phpize "/usr/bin/phpize$php_ver" && \
  service "php$php_ver-fpm" start && \
  service nginx restart

  # 4). This PPA messes with locales. Re-add manually:
  locale-gen en_NZ en_NZ.UTF-8 && update-locale LANG=en_NZ

  # 5). Re-build Xdebug (Warning: We do this regardless of the cat.hieria setting for xdebug in Vagrantfile)
  ini_file="/etc/php/$php_ver/mods-available/xdebug.ini"
  echo -e "zend_extension = xdebug.so\nxdebug.remote_enable = 1\nxdebug.remote_connect_back = 1" >> $ini_file

  # 6). Re-build composer.lock becuase we've changed the PHP version the project may originally have been built against
  rm -f /vagrant/composer.lock || true
}

echo "[SSTeam] Installing custom PHP version $php_ver"

if [ "$os" = 'xenial' ]; then
  # Don't do anything if $php_ver is '7.0', otherwise...
  if [ ! \( "$php_ver" = '7.0' \) ]; then
    cd /vagrant && do_php
  fi  
elif [ "$os" = 'bionic' ]; then
  # Don't do anything if $php_ver is '7.2', otherwise...
  if [ ! \( "$php_ver" = '7.2' \) ]; then
    cd /vagrant && do_php
  fi  
fi  

echo "[SSTeam] Configure PHP for dev-specific settings"

IFS_O=$IFS;IFS=',' read -r -a array <<< "$( echo 'cli,fpm' )"
for sapi in ${array[@]}; do
  sed -i -e 's#display_errors = Off#display_errors = On#g' "/etc/php/$php_ver/$sapi/php.ini"
  sed -i -e 's#error_reporting = .*#error_reporting = E_ALL#g' "/etc/php/$php_ver/$sapi/php.ini"
done;
IFS=$IFS_O

echo "[SSTeam] Composer all the things!"

composer --quiet self-update || true

# The previous environment setup within devtools and 'composer self-update' introduces this folder
# We need to remove it, otherwise SilverStripe will complain the duplicated autoloader files are found
rm -rf /vagrant/.composer

cd /vagrant && do_composer

echo "[SSTeam] Setting correct permissions"
cd /vagrant && chown -R vagrant:www-data .
cd /vagrant && chmod -R 775 .

chown -R vagrant:www-data /var/tmp/silverstripe-cache/ && chmod -R 777 /var/tmp/silverstripe-cache/

# Fix perms on .htaccess files which causes _so much_ grief..
cd /vagrant && for file in $( find . -name .htaccess); do chown www-data:www-data $file && chmod 775 $file; done

if [[ "${remove_public}" -eq 1 ]]; then
  echo "[SSTeam] Fixing document root for pre 4.1 setups"
  # Optionally fix a Xenial box for a >v3,<4.1 SS setup _without_ a "public" dir
  sed -i -e 's#/public##g' "/etc/nginx/sites-available/silverstripe-$project_name.conf"
fi

echo "[SSTeam] Setting team config"

cp /vagrant/.git-completion.sh /home/vagrant/

if [[ ! $( grep 'SilverStripe' /home/vagrant/.bashrc ) ]]; then
  echo "source ~/.git-completion.sh" >> /home/vagrant/.bashrc
  cat /vagrant/.ps1 >> /home/vagrant/.bashrc
  echo "export COMPOSER_HOME='/home/vagrant/'" >> /home/vagrant/.bashrc
  echo "$( echo -e "" && cat /vagrant/.profile )" >> /home/vagrant/.profile && rm -f /vagrant/.profile
fi

echo "[SSTeam] Configuring RDBMS"

if [ "$rdbms" = 'mysql' ]; then
  cd /vagrant && sed -i -e 's#PostgreSQLDatabase#MySQLDatabase#g' .env
fi

# The "current" verson of PHP may have changed away from the default, thus making php<version>-rpm service calls fail
curr_ver=$( php -v | head -1 | sed 's#[^0-9.0-9]##g' | awk -F. '{print $1"."$2}' )

service "php$curr_ver-fpm" restart && service nginx restart

echo "[SSTeam] Linting custom code"

cd /vagrant && ./.tools/lintphp.sh
