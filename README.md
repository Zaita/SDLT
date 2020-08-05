# NZTA Security Development Lifecycle Tool

The SDLT is Web Application that supports, and expedites I.T. security professionals as part of the change approval process within their organisation.

## Requirements

The SDLT is written in ReactJS and PHP and built on the [SilverStripe](https://silverstripe.org) framework. As such, in order to install the software you will need access to a dedicated LAMP, LEMP or similar environment. Refer to the official [Server Requirements Documentation](https://docs.silverstripe.org/en/4/getting_started/server_requirements/) to help you spec a suitable configuration for your SDLT.

This repository consists of three parts:
* the base project, which includes a Docker image as well as metadata about the project.
* [the SDLT framework](https://github.com/nzta/sdlt-framework), which includes the Silverstripe framework and CMS as dependencies and powers the GraphQL endpoints
* [the SDLT theme](https://github.com/nzta/sdlt-theme), which is a front-end React framework designed to communicate with Silverstripe via GraphQL.

### Infrastructure

* See the [Server Requirements Documentation](https://docs.silverstripe.org/en/4/getting_started/server_requirements/) but Apache httpd or Nginx on a Linux distribution e.g. Ubuntu is typical
* See the [Server Requirements Documentation](https://docs.silverstripe.org/en/4/getting_started/server_requirements/) but MySQL or MariaDB will work. PostgreSQL may work, but is untested. (You will need to alter the project's `.env` file to suit)
* A minimal `.env` file. (You can adapt the one provided at the root of this codebase)
* Test the setup by running: `./vendor/bin/sake dev/build` (CLI) or pointing a GUI browser at: https://my-sdlt.dept.govt.nz/dev/build.

## Installation

This assumes you have a LAMP environment: Linux (Ubuntu), Apache (v2), MySQL (5.7) and PHP (7.2).

```sh
#clone most stable version directly from Github
composer create-project nzta/sdlt my-app ^3

#make a .env if you haven't yet

#build database tables
vendor/bin/sake dev/build flush=

#(optional) setup default data, see "Data Import" below
vendor/bin/sake dev/tasks/SetupSDLTDataTask 

#(optional) change permissions on homepage to login-only
vendor/bin/sake dev/tasks/HydrateCustomConfig
```

The `public/assets` folder needs to be writeable by the webserver user. You may also need to make `public/assets/.htaccess` and `public/assets/.protected` writeable. 

### Data Import

The codebase comes with a data-importer which will configure most of what you will need to get up and running with the tool.

* On the CLI or within the browser run: dev/tasks/SetupSDLTDataTask. This can take several minutes, and may exceed your server's script execution time. If the script fails, new data will only be generated where it left off.
* Login to the SilverStripe admin area to verify this data, by using the `SS_DEFAULT_ADMIN_XXX` vars below at: `https://my-sdlt.dept.govt.nz/admin/?showloginform=1`. 
* This data is generated from a default set and contains a set of default questionnaires, tasks, and risk assestments that you are able to alter for your own needs. 

### Customisation:

* The frontend is a React application whose application logic, templates and CSS are found in the: "themes/sdlt" directory. It is theoretically possible to replace this theme with your own GraphQL-powered theme. To do this, you will need to replace the sdlt-theme project with your own implementation of it. This capability is currently untested and undocumented.
* To add further calculation algorithms to appear in "Risk Questionnaire" Tasks, developers will need to subclass `app/src/Formulae/RiskFormula.php` (See app/src/Formulae/NztaApproxRepresentation.php and its tests as an example).

### Config

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

### Setting up Azure Active Directory

This application normally uses SilverStripe's default authentication system (username and password). It can optionally be configured to support Azure's Active Directory service or any provider that supports OAuth2.

Instructions for configuring SDLT to work with Azure and other OAuth providers can be found here: https://github.com/NZTA/SDLT/wiki/Installing-Active-Directory

### Setting up project using docker
Make sure you have docker and docker compose installed on your machine and then run the below commands.

Clone the repository
```
git clone git@github.com:NZTA/SDLT.git
```
Create .env file
```
cp .env.example .env
```
Starts the containers in the background and leaves them running
```
docker-compose up -d
```
Displays log output from services.
```
docker logs -f sdlt_php
```
