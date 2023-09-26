# Single-Sign On Configuration
```{contents} Contents
:depth: 4
```

## Okta
The SDLT supports integration with Okta via OIDC/OAuth2.

### Okta Configuration
In Okta, enter the Admin panel and create a new application integration.
* Sign-in method: OIDC - OpenID Connect
* Application type: Web Application

The default values should be fine:
* Grant Type: Authorization Code 

The Login details:
* Sign-In redirect URIs: http://mysdlt.xyz/oauth/callback

Create the application then save the Client ID, and Client Secret.

### Preparing the SDLT
The SDLT will require the installation of extra compose modules to integrate with Okta. The following two modules can be installed with `composer require` or added to the `composer.json` file.

1. "bigfork/silverstripe-oauth-login": "*
2. "foxworth42/oauth2-okta": "^1.0"

Next, you will need to modify the `mysite.yml` file located in `sdlt/app/_config/mysite.yml`
Add the following information:
```none
SilverStripe\Core\Injector\Injector:
  SilverStripe\Security\MemberAuthenticator\CookieAuthenticationHandler:
    calls:
      - [ setTokenCookieSecure, [ true ] ]
  Bigfork\SilverStripeOAuth\Client\Factory\ProviderFactory:
    properties:
      providers:
        'Okta': '%$OktaProvider'
  OktaProvider:
    class: 'Foxworth42\OAuth2\Client\Provider\Okta'
    constructor:
      Options:
        redirectUri: 'http://mysdlt.xyz/oauth/callback'
        clientId: '<< from Okta >>'
        clientSecret: '<< from Okta >>'
        issuer: 'https://<<yourorganisation>>.okta.com/oauth2/default'
        graphApiVersion: 'v2.6'          
Bigfork\SilverStripeOAuth\Client\Authenticator\Authenticator:
  providers:
    'Okta': # Matches the key for '$%OktaProvider' above
      name: 'Okta'
      scopes: ['openid', 'profile', 'email'] 
```

### Testing
SilverStripe may (or may not) automatically pick up your configuration. If it doesn't, you will need to go to the following URL:
http://mysdlt.xyz/dev/build?flush=true

_Note: The SS_ENVIRONMENT_TYPE variable in .env will need to be set to dev to do this from the browser, otherwise you will need to do it from the command line.
using `php vendor/silverstripe/framework/cli-script.php dev/build` from the project root folder_

## Microsoft Azure AD
TBD


