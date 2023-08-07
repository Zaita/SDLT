# The SDLT
The SDLT, previously named the Security Development Lifecycle Tool, is a web application workflow tool for the implementation of
software delivery, security development, service delivery and many more processes.

The SDLT is a no-code solution, allowing quick and easy deployment of workflows that support organisational delivery processes. You can have your organisation running submissions in a few minutes with the pre-configured workflows.

The tool comes pre-configured with:
- Pre-configured workflows to illustrate different common scenarios
- Built in approval flows with delegation ability
- Digital security risk assessment capability
- Control validation audit capability
- Certification and accreditation capability
- Service inventory module built in to certification and accreditation
- Reports

The SDLT is Web Application that supports, and expedites I.T. security professionals as part of the change approval process within their organisation. 

## This Fork
This fork is now the primarily repository for the SDLT.

The SDLT was previously owned and hosted by The New Zealand Transport Agency (Waka Kotahi), but they are no longer managing the project or code-base. This fork was done to continue development of new functionality, and ensure the product remained open source.

## Getting Help or Hosting
If you would like to run the SDLT, we first recommend downloading the code and following the deployment instructions yourself to have a go.

If you would prefer to have a custom demo available to you, please log an issue against this project with contact details (email) and we'll reach out.

If you would like professional hosting of the SDLT, please reach out to Catalyst (NZ) Limited.

If you would like a fully managed instance, with us looking after the day to day setup, configuration and maintenance, please log an issue against this project with your email and we'll reach out.

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

This assumes you have a LAMP environment: Linux (Ubuntu), Apache (v2), MySQL (5.7) and PHP (7.2). Another assumption is that you're using a virtualhost on Apache. We assume your project is installed at /var/www/example.com/sdlt with a DocumentRoot set to something like /var/www/example.com/sdlt/public.


```sh
cd /var/www/example.com/
#clone most stable version directly from Github. This also runs composer automatically
composer create-project nzta/sdlt sdlt ^3

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
