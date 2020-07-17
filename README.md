# NZTA Security Development Lifecycle Tool

The SDLT is Web Application that supports, and expedites I.T. security professionals as part of the change approval process within their organisation.

## Requirements

The SDLT is written in ReactJS and PHP and built on the [SilverStripe](https://silverstripe.org) framework. As such, in order to install the software you will need access to a dedicated LAMP, LEMP or similar environment. Refer to the official [Server Requirements Documentation](https://docs.silverstripe.org/en/4/getting_started/server_requirements/) to help you spec a suitable configuration for your SDLT.

### Infrasructure

* See the [Server Requirements Documentation](https://docs.silverstripe.org/en/4/getting_started/server_requirements/) but Apache httpd or Nginx on a Linux distribution e.g. Ubuntu is typical
* See the [Server Requirements Documentation](https://docs.silverstripe.org/en/4/getting_started/server_requirements/) but MySQL or MariaDB will work. PostgreSQL may work, but is untested. (You will need to alter the project's `.env` file to suit)
* A minimal `.env` file. (You can adapt the one provided at the root of this codebase)
* Test the setup by running: `./vendor/bin/sake dev/build` (CLI) or pointing a GUI browser at: https://my-sdlt.dept.govt.nz/dev/build.

### Data Import

The codebase comes with a data-importer which will configure most of what you will need to get up and running with the tool.

* On the CLI or within the browser run: dev/tasks/SetupSDLTDataTask
* Login to the SilverStripe admin area to verify these data, by using the `SS_DEFAULT_ADMIN_XXX` vars below at: `https://my-sdlt.dept.govt.nz/admin/?showloginform=1` (This skips the default Active Directory authentication for now)

### Customisation:

* The frontend is a REACT application whose application logic, templates and CSS are found in the: "themes/sdlt" directory
* To add further calculation algorithms to appear in "Risk Questionnaire" Tasks, developers will need to subclass `app/src/Formulae/RiskFormula.php` (See app/src/Formulae/\NztaApproxRepresentation.php and its tests as an example).

### Config

Rename the `.env.example` file included with the project to `.env` and ensure it is in the project-root with r+x permissions by your webserver's user. You'll need to change the dummy entries for the environment variables within the file, to suit your own environment.

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
### Setting up project manually
As of tag 2.1.0, the SDLT can be installed with the following command:
```
#install from source
composer create-project nzta/sdlt /path/to/sdlt-app 2.1.0

#build database
cd sdlt-app
vendor/bin/sake dev/build flush=

#setup default data
vendor/bin/sake dev/tasks/SetupSDLTDataTask

```
