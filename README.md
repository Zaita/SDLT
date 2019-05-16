# NZTA Software Development Lifecycle Tool
(project description here)

## Installation
(todo)

## To install active directory please run below command in YourName project root directory
 composer require catalyst/silverstripe-active-directory

## Please add below code in the composer.json file of your project
```
"repositories": [
    {
        "type": "vcs",
        "url": "git@gitlab.catalyst.net.nz:SilverStripe/silverstripe-active-directory.git"
    }
],
```

## Configuration and Personalisation
* To change the title please add below code in app/lang/en.yml file
```
en:
  Bigfork\SilverStripeOAuth\Client\Authenticator\Authenticator:
    TITLE: 'Change your title text please'
```

A default set of questionnaires, tasks, pillars, questions, and answers has been created and distributed in CSV format. You can use this to populate your database as a starting point, then tailor the existing set for your own needs.  Run `vendor/bin/sake dev/tasks/NZTA-SDLT-Tasks-SetupSDLTDataTask` if you want to use this data. Note that this set of information does _not_ include questionnaire emails, which need to be set up for each installation.

#### Adding new administrators setup
When using the Active Directory module, all users that are intended to use this system must first log into SilverStripe via AD so that SilverStripe can automatically create an account for them. On their first successful login, a Member account containing their first name, surname, email address, and unique Member Identifier will be created in the Security section of the CMS. This account *will not*, and *must not*, have any privileges until an existing Administrator adds them to the appropriate group. Attempts to create the accounts beforehand will result in an error. Once a group is assigned, these users will be able to log in with their Active Directory accounts.
