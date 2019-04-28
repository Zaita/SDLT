<?php
/**
 * This file contains the global app configuration settings
 * These are often configuration settings which cannot be passed into Config or
 * be activated from within a class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright 2019 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

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
use SilverStripe\Control\Controller;

// remove PasswordValidator for SilverStripe 5.0
$validator = PasswordValidator::create();
// Settings are registered via Injector configuration - see passwords.yml in framework
Member::set_password_validator($validator);


// for the initial release, Azure Active Directory is the default login scheme.
// A future release will make AAD optional.
// we need the default authenticator to be available for two reasons:
// * when a non-AAD user needs to login with a SilverStripe-managed Member
// * when any non-Silverstripe user needs to log out
//
// The first case passes in a showloginform=1 parameter. This makes the default
// authenticator available for logins. This will set a cookie to be utilised on
// subsequent login/logout requests throughout the session.
//
// The second case appears whenever a SecurityID is present as a GET parameter
// This makes the default authenticator available for one request, but is not
// sufficient to allow a login if the SecurityID is incorrect. However, the
// React app obtains the correct SecurityID and passes it in to the request.
// This allows all users with a valid SecurityID to log out immediately.
// SilverStripe users who need to logout will have already passed in the
// showloginform parameter, and thus are not affected by this case.

if (isset($_GET['showloginform'])) {
    Cookie::set('showloginform', (bool)$_GET['showloginform'], 1, 0);
}

if (Cookie::get('showloginform') || isset($_GET['SecurityID'])) {
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
