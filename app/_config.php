<?php

use SilverStripe\Security\PasswordValidator;
use SilverStripe\Security\Member;
use SilverStripe\LDAP\Authenticators\LDAPAuthenticator;
use SilverStripe\Control\Cookie;
use SilverStripe\Core\Config\Config;
use SilverStripe\Core\Injector\Injector;
use SilverStripe\Security\Authenticator;
use SilverStripe\Security\Security;
use SilverStripe\Security\MemberAuthenticator\MemberAuthenticator;
use SilverStripe\CampaignAdmin\CampaignAdmin;
use SilverStripe\Admin\CMSMenu;
use SilverStripe\Reports\ReportAdmin;

// remove PasswordValidator for SilverStripe 5.0
$validator = PasswordValidator::create();
// Settings are registered via Injector configuration - see passwords.yml in framework
Member::set_password_validator($validator);


if (isset($_GET['showloginform'])) {
    Cookie::set('showloginform', (bool)$_GET['showloginform'], 1, 0);
}

if (Cookie::get('showloginform')) {
    Config::modify()->merge(Authenticator::class, 'authenticators', [MemberAuthenticator::class]);

    Config::modify()->merge(Injector::class, Security::class, [
        'properties' => [
            'Authenticators' => [
                'default' => '%$' . MemberAuthenticator::class,
            ]
        ]
    ]);
}

CMSMenu::remove_menu_class(CampaignAdmin::class);
CMSMenu::remove_menu_class(ReportAdmin::class);
