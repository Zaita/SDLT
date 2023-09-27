# Installation

## Quick and Dirty Docker
Below is a quick and dirty way to get the SDLT running locally with docker. You will need to have docker and docker-compose installed.

The following commands can be used to download the source code from GitHub and run the SDLT in a default local docker configuration:
1. Download the source code from GitHub and start the docker containers
```bash
git clone https://github.com/zaita/sdlt
cd sdlt && cp .env.example .env
docker-compose up -d
```
2. Wait for the sdlt_php container to be ready for connections, can be monitored with:
```bash
docker logs -f sdlt_php
```
3. Navigate to `http://127.0.0.1:8123` and login with admin credentials in `.env`

_Note: The sdlt_php container will take a few minutes to start up as it needs to compile in some extra PHP modules and import the default SDLT configuration into the MySQL database_

## Requirements
The SDLT is written in ReactJS and PHP and built on the [SilverStripe](https://silverstripe.org) framework. As such, in order to install the software you will need access to a dedicated LAMP, LEMP or similar environment. Refer to the official [Server Requirements Documentation](https://docs.silverstripe.org/en/4/getting_started/server_requirements/) to help you spec a suitable configuration for your SDLT.

This repository consists of three parts:
* the base project, which includes Docker compose files as well as metadata about the project.
* [the SDLT framework](https://github.com/zaita/sdlt-framework), which includes the Silverstripe framework and CMS as dependencies and powers the GraphQL endpoints
* [the SDLT theme](https://github.com/zaita/sdlt-theme), which is a front-end React framework designed to communicate with Silverstripe via GraphQL.

If you wish to run the project in a docker container, then you will only need:
* docker.io
* docker-compose

### Infrastructure Requirements
* See the [Server Requirements Documentation](https://docs.silverstripe.org/en/4/getting_started/server_requirements/) but Apache httpd or Nginx on a Linux distribution e.g. Ubuntu is typical
* See the [Server Requirements Documentation](https://docs.silverstripe.org/en/4/getting_started/server_requirements/) but MySQL or MariaDB will work. PostgreSQL may work, but is untested. (You will need to alter the project's `.env` file to suit)
* A minimal `.env` file. (You can adapt the one provided at the root of this codebase)
* Test the setup by running: `./vendor/bin/sake dev/build` (CLI) or pointing a GUI browser at: https://my-sdlt.dept.govt.nz/dev/build.

## Installation with Composer
This assumes you have a LAMP environment: Linux (Ubuntu), Apache (v2), MySQL (5.7) and PHP (8.1). Another assumption is that you're using a virtualhost on Apache. We assume your project is installed at /var/www/example.com/sdlt with a DocumentRoot set to something like /var/www/example.com/sdlt/public.

```none
cd /var/www/example.com/
#clone most stable version directly from Github. This also runs composer automatically
composer create-project zaita/sdlt sdlt ^5

#change directory
cd sdlt

#make a .env if you haven't yet
cp .env.example .env

#build database tables
vendor/bin/sake dev/build flush=

#(optional) setup default data, see "Data Import" below
vendor/bin/sake dev/tasks/SetupSDLTDataTask 

#(optional) change permissions on homepage to login-only
vendor/bin/sake dev/tasks/HydrateCustomConfig
```

The `public/assets` folder needs to be writeable by the webserver user. You may also need to make `public/assets/.htaccess` and `public/assets/.protected` writeable. 
`sudo chown -R www-data:www-data public/assets public/assets/.htaccess public/assets/.protected`

## Data Import
The codebase comes with a data-importer which will configure most of what you will need to get up and running with the tool.

* On the CLI or within the browser run: dev/tasks/SetupSDLTDataTask. This can take several minutes, and may exceed your server's script execution time. If the script fails, new data will only be generated where it left off.
* Login to the SilverStripe admin area to verify this data, by using the `SS_DEFAULT_ADMIN_XXX` vars below at: `https://my-sdlt.xyz/admin/?showloginform=1`. 
* This data is generated from a default set and contains a set of default questionnaires, tasks, and risk assestments that you are able to alter for your own needs. 

## Customisation:
* The frontend is a React application whose application logic, templates and CSS are found in the: "themes/sdlt" directory. It is theoretically possible to replace this theme with your own GraphQL-powered theme. To do this, you will need to replace the sdlt-theme project with your own implementation of it. This capability is currently untested and undocumented.
* To add further calculation algorithms to appear in "Risk Questionnaire" Tasks, developers will need to subclass `app/src/Formulae/RiskFormula.php` (See app/src/Formulae/NztaApproxRepresentation.php and its tests as an example).

### Initial Config
Rename the `.env.example` file included with the project to `.env` and ensure it is in the project-root with r+x permissions by your webserver's user. You'll need to change the dummy entries for the environment variables within the file, to suit your own environment. Alternatively, you can create environment variables on your server in place of a .env file.

In order to protect the entire project behind an authentication screen, run the following task:

```
./vendor/bin/sake dev/tasks/HydrateCustomConfig
```

### Tests

To run the suite ("dev" environments only - see the .env file example below):

```
./vendor/bin/phpunit
```

## Site Customisation / Themes
Once you have the SDLT running, you will want to configure some basic settings to give it a more custom look suitable for your environment.
Firstly, navigate to the admin panel (http://my-sdlt.xyz/admin) and login using the admin credentials in the `.env` file.

We will firstly configure the site name, this appears in the admin panel at the top level and in the title of the web browser tab.
This can be configured under `Settings -> Main`.

Next you can change the colour scheme of the SDLT by modifyig the `Settings -> Theme`.

Next you can change the images used within the SDLT by modifying the `Settings -> Images`.

Further customisations can be done in the `Settings` section of the admin panel, these will be described under advanced configurations.
