
# Catalyst SilverStripe Team Meta Package

## What is this?

A "meta-package" for dropping into client projects, new and existing. It contains mostly automated configuration that ensures our projects are developed to a consistent standard. It avoids "works here" syndrome and comprises a [devtools](http://devtools-docs.wgtn.cat-it.co.nz/)-inspired Vagrant configuration for development _and_ CI (Continuous Integration) environments. It is designed to allow the team to work in a consistent environment, with a consistent setup, for _every_ project. It means your colleagues (or _you_!) need not expect too many surprises, once they get hold of the codebase in the future.

## Requirements

In order to do anything useful with this package and any client project that includes it, your workstation / laptop will need to have Catalyst's [devtools](http://devtools-docs.wgtn.cat-it.co.nz/) dependencies setup:

 1. [Setup your workstation with Catalyst's "devtools" apt repository](http://devtools-docs.wgtn.cat-it.co.nz/installation.html#adding-the-apt-repository)
 2. [Install "LXD Catalyst"](http://devtools-docs.wgtn.cat-it.co.nz/lxd.html)
 3. [Install "Catalyst Vagrant"](http://devtools-docs.wgtn.cat-it.co.nz/catalyst-vagrant.html#installation)

**Note:** If you've already got an existing "raw" vagrant installation, you can map calls to `vagrant` to your `catalyst-vagrant-2.0` program by using `update-alternatives`. [See here](http://devtools-docs.wgtn.cat-it.co.nz/catalyst-vagrant.html#installation).

## Configuration

Clone this meta-package into your home directory for example:

```
#> cd && git clone https://gitlab.wgtn.cat-it.co.nz/SilverStripe/team-meta-package --branch master
```

Once cloned; `cd` into your project directory and copy the meta-package's files into your project:

```
#> cd ~/htdocs/sites/my-project && rsync -apC ~/team-meta-package/ .
```

Now run the init script and tell it about your project such its name, VCS info, database and PHP version to use. This will configure your project (new or old), as a standardised team setup and automatically create a GIT commit for you. You will need your Gitlab and Redmine API keys to hand, in order to run this.

For example; the following command will configure your project to use "my-project" as the DB name+user+password and the dev-environment's hostname. The argument to `-t` is a colon-separated string of your personal gitlab API "Access Key" and Redmine "API Key". Each can be found at: `<gitlab Url>/profile/personal_access_tokens` and `<Redmine Url>/my/account` respectively. It will use mysql, PHP 7.1 and will generate a `dashboard.json` file, and git-commit it all with reference to the WR: "123456":

```
#> ./.tools/init.sh -n my-project -f 'My Project' -g https://gitlab.catalyst.net.nz/SilverStripe/my-project -G 1234 -w 123456 -d mysql -v 4 -p 7.1 -t '1234:abcd' -r
```

This sets everything up, including filesystem permissions and will also run composer install. Note: If you pass vagrant a different version of PHP since it was initialised, `composer.lock` will be deleted, to ensure the composer deps are built against the appropriate PHP version and extensions.

```
Usage: ./.tools/init.sh -n <Short Name> [ -f '<Full Name>' ] -g <VCS Url> -G <Gitlab ID> -w <WRMS ID> -d <mysql|postgres> -v <3|4> -p <5.6|7.0|7.1|7.2|7.3> -t abcd:1234 [ -r ]
```

* `-n` "Name": Your project's name e.g. "trc" or "niwa-os2020" (Be careful with special characters. This value is used as the DB name+username+password, webserver document root and several other things)
* `-f` "Full name": The full-name of the project as per the relevant Redmine project. Leave this blank if there isn't one. (Used in `dashboard.json`)
* `-g` "Gitlab url": The full URL of your project's gitlab project (Used in `dashboard.json`)
* `-G` "Gitlab ID": The Gitlab project ID (Hint: You can see it on your project's Gitlab "Homepage" e.g. `Project ID: 71`. Used in `dashboard.json`)
* `-w` "WR": The top-level WR for this project e.g. `123456` (Used in the automated initial commit)
* `-d` "Database": The RDBMS this project uses. One of "mysql" or "postgres"
* `-v` "Version": The SilverStripe version. (Note: SS3 is _not_ well supported by this package - yet)
* `-p` "Php": The version of PHP you want to provision this project with. Note: This should be matched with the target _deployment_ environment
* `-t` "Tokens": A colon-separated string in the following format: `<gitlab>:<redmine>`
* `-r` "Remove": Remove the `public` directory as a document root. SilverStripe pre v4.1 projects aren't aware of any "public" directory, which the "silverstripe4" devtools project-type gives us OOTB.

## What does it give me?

A halfway decent development and CI environment with automated setup via an init script that gives a project:

* Sentry package and standard team config
* Grumphp package and standard team config
* A project-specific `dashboard.json` file for use in the team's dashboard
* Catalyst devtools-flavoured Vagrant development environment with;
  * Mail setup via fakesmtp
  * MySQL or Postgres
  * Custom PHP version
  * SSL by default
  * `/etc/hosts` auto config
  * XDebug enabled by default
* A team standard `.gitignore` file
* A team standard `php-cs-fixer` config (See: tools/lintphp.sh)
* A team standard `.editorconfig` IDE/Editor config
* A team `humans.txt` file
* A team `changelog` tool
* A team package security tool (Invoked as: `./.tools/security.sh`)
* Git tab completion
* Git highlighted project-name and branch in PS1
* Forwarded SSH keys, so calls to git commands in the VM, use your own (The host's) SSH keys
* Node, npm and yarn
* Catalyst devtools-flavoured gitlab CI

## How does it work?

Say your project name (and the URL of the VM to develop on) is called "my-project" then:

```
# Fetch this meta-package into your home directory, and use its files:
#> cd && git clone git@gitlab.wgtn.cat-it.co.nz:SilverStripe/team-meta-package.git
#> rsync -aC ~/team-meta-package/ .
```
```
# Modify
Some files are not relevant to your project, for example:

#> rm index.ss4.php
#> rm ruleset.ss3.xml
#> git checkout README.md

You should also modify and reference "humans.txt" as appropriate from your project theme's "Page.ss"
```
```
# Initialise these raw files with the name of your project
See example invocation above.
```
```
# Start your Vagrant box        
#> vagrant-catalyst-2.0 up --provider=lxd
```
```
# Now either SSH into the box...
#> vagrant-catalyst-2.0 ssh
```
Now visit it in a browser: https://my-project/

### How to setup CI?

Any project setup with the meta-package comes with a default `.gitlab-ci.yml` file which will allow projects to run thei CI jobs within a Docker-ised Gitlab CI environment. **Before you start** and before CI will work for your project, you will need to contact Evan or Nick to setup the project's Docker-based CI environments. Things don't quite work "out of the box"!

Config is derived from [upstream work](http://devtools.pages.gitlab.wgtn.cat-it.co.nz/docs/catalyst-vagrant/docker-images.html#) found in the [devtools project](http://devtools.pages.gitlab.wgtn.cat-it.co.nz/docs/index.html).

### How to check package security?

    #> ./.tools/security.sh
    
...or add the command to `composer.json`

```
  ...
  "scripts": {
    "post-update-cmd": [
      "# Analysing package security status...",
      "./.tools/security.sh"
    ],
    "post-install-cmd": [
      "# Analysing package security status...",
      "./.tools/security.sh"
    ]
  },
  ...
```

### How to lint my PHP?

By default, when the provisioner is almost complete; the last thing it does automatically is run php-cs-fixer over the project's "app" or "mysite" directory, and creates a separate commit out of the changes.

To invoke it manually, during development:

    #> ./.tools/lintphp.sh
    
### How do I create a CHANGELOG?

When we're dealing with deployments using any of [deployer](https://deployer.org), Deploynaut, CWP's ["Dash"](https://dash.cwp.govt.nz) tool or Catalyst's fabricdeploy; We should send clients a list of the changes between the last deployed version and the current version. This can be invoked manually as follows; or incorporated into a project's CI by modifying the project's `gitlab-ci.yml` file.

    #> ./changelog.sh -f 1.2.7 -t 1.2.8 -r https://gitlab.catalyst.net.nz/SilverStripe/MyProject
    
```
Usage: ./changelog.sh -f <tag> -t <tag> -r <gitlab-base-url> -p <project>
```

* `-f` "From": The GIT tag from where a changeset should be taken
* `-t` "To": The GIT tag to where a changeset should be taken
* `-r` "Remote": The absolute URL to the project's GIT repo

## Checklist

* Have you exposed the appropriate project files (e.g. under "themes/mytheme") using `composer vendor-expose`?

Add something like this to your project's `composer.json`:

```
    ...
    "extra": {
        "expose": [
            "themes/mytheme/dist",
            "themes/mytheme/fonts",
            "themes/mytheme/images"
        ],
    ...
```

* Have you created an account in Sentry?

This package installs the `[phptek/sentry](https://github.com/phptek/silverstripe-sentry)` composer dependency into your project. Ensure you have created a Sentry account at ***REMOVED*** for it and updated `sentry.yml` accordingly.

## FAQ

### What's the URL of my project?

If you passed "my-project" as the `-n` flag to `tools/init.sh`, then the URL on your dev-environment becomes:

```
https://my-project/
```

You will need to accept an exception for this site's SSL cert into your browser(s). This is because the Host => IP mapping for each project's box will change each time it is provisioned or initialised.

### I've changed my `Vagrantfile` now what?

```
#> vagrant-catalyst-2.0 reload
```

### I've customised `tools/provision.sh` now what?

```
#> vagrant-catalyst-2.0 provision --provision-with shell
```

### Can I run dev/build on the CLI? 

Of course!

```
vagrant@niwa-proxy:/vagrant (develop) $> sudo -u www-data ./vendor/bin/sake dev/build flush=all
```

### What is humans.txt?

It's a simple counter to the decades-old favouritism towards bots and a [robots.txt](https://robotstxt.com) file located in the document root of a project. The [humans.txt](https://humanstxt.com) initiative simply add us Humans back into the mix. 

See more [here](http://humanstxt.org/Standard.html]).

Add a reference to it from `templates/Page.ss`:

```
<link rel="author" href="/humans.txt" />
```

### Why do I get an Nginx "Bad Gateway" error?

First port of call are nginx's logs: `/var/log/nginx/*` but also check your host machine's `/etc/hosts`. Sometimes `vagrant-hostmanager` gets mixed up and doesn't delete old entries for the same project (Vagrant assigns a new internal IP each time a box is provisioned) e.g. 
                
```
87 ## vagrant-hostmanager-start id: 2922db43-5677-4c7e-b3b9-aa33cc4848a6
88 10.0.3.123      niwa-proxy
```
### I already have Vagrant installed...

That's OK, `vagrant` can be run alongside `catalyst-vagrant-x.x`, but you'll either need to invoke `catalyst-vagrant-2.0` each time, or switch to using the latter full-time by mapping calls to `vagrant` to `vagrant-catalyst-2.0`. [See here](http://devtools-docs.wgtn.cat-it.co.nz/catalyst-vagrant.html#installation) for how to do this.

### Where are the webserver logs?

This is a devtools thing:

    #> tail -f /var/log/sitelogs/silverstripe/<project_name>/nginx_access.log
    #> tail -f /var/log/sitelogs/silverstripe/<project_name>/nginx_error.log
                  
### Why are my CSS styles not being served?

Something's gone wrong with SilverStripe's `composer` config for the "expose" directive. See: [SilverStripe's Github page](https://github.com/silverstripe/vendor-plugin) for more info.

### I'm using Ubuntu Bionic..

There are some known issues with devtools and Bionic. See the following pages that may help you:

* [Thor's LXD problem]([https://github.com/silverstripe/vendor-plugin)
* [Devtools: LXC + Bionic](http://devtools-docs.wgtn.cat-it.co.nz/catalyst-vagrant.html?highlight=bionic#troubleshooting)

### My VM uses "lxc" but Vagrantfile stipulates "lxd"

Older versions of the meta-package didn't put the provider configuration in the correct spot within the `Vagrantfile`. Make sure the following block sits right at the top of your `Vagrantfile`, right before `config.catalyst.platform = 'xxx'` e.g.:

```
...
config.vm.provider 'lxd' do |lxd|
  lxd.name = project_name
end
config.catalyst.platform = 'ubuntu-16.04'
...
```

### How do I get BrowserSync Working?

Assuming you're using Gulp, then edit the `gulpfile.js` and ensure the following config is present: (Replace "my-project" with the _actual_ name of your project).

```
var PROXY_URL = 'https://my-project/';
```

### My VM's permissions are all janky

If you're using LXD as your provider and your VM's end up with files and dirs owned as `nobody:nogroup`, then you need to ensure that LXD can leverage your current user to perform actions in the VM on your user's behalf. The solution is to:

 * Ensure the files and dirs in your project, are user+group owned by your user
 * You may need to edit `/etc/subuid` as follows, then restart lxd:
 
 ```
 cd /path/to/project && sudo chown -R janedoe:janedoe .
 echo "janedoe:165536:65536" >> /etc/subuid
 service lxd restart
 ```

