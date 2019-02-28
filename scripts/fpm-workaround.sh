#!/bin/bash
#
# Simple workaround for pre-existing setups that have the php-fpm problem
# where devtools defaults to its own fpm, and not the custom one declared on project init
#
# Russell Michell 2019 <russellmichell@catalyst.net.nz>
#
# Usage: (from within a VM)
#
# $> sudo ./scripts/fpm-workaround <project-name> <php-version>

project_name="$1"
php_ver="$2"

# Unlink the "bad" socket
echo "=> Up hook: Unlink default devtools php-fpm socket..."
sudo rm -f "/var/run/silverstripe-site-$project_name.socket"

# Re-build the link to the correct socket for php-7.2-fpm (for example)
echo "=> Up hook: Build desired php-fpm ($php_ver) socket..."
sudo ln -s "/var/run/php/php$php_ver-fpm.sock" "/var/run/silverstripe-site-$project_name.socket"

# Kill the unwanted service
echo "=> Up hook: Killing default devtools php-fpm service..."
sudo kill -9 $( ps -aux | grep 'php/7.0' | head -1 | awk '{print $2}' )

