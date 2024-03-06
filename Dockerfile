FROM webdevops/php-nginx:8.3
WORKDIR /var/www/html
COPY . /var/www/html
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN apt-get update
RUN apt-get -y install libicu-dev wget git zip unzip zlib1g-dev libpng-dev libfreetype6-dev libjpeg62-turbo-dev
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install gd intl mysqli pdo_mysql
RUN curl -sSL https://getcomposer.org/composer.phar > /usr/local/bin/composer && chmod +x /usr/local/bin/composer 
RUN composer update
RUN composer install
EXPOSE 80
EXPOSE 9000
RUN /var/www/html/vendor/bin/sake dev/tasks/HydrateCustomConfig
CMD ["/bin/bash", "-c", "php-fpm && chmod 755 /var/www/html/* && nginx -g 'daemon off;'"]
