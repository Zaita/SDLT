<?php

use SilverStripe\Security\PasswordValidator;
use SilverStripe\Security\Member;
use SilverStripe\Control\Director;

// remove PasswordValidator for SilverStripe 5.0
$validator = PasswordValidator::create();
// Settings are registered via Injector configuration - see passwords.yml in framework
Member::set_password_validator($validator);

$url = getenv('SS_BASE_URL');

if (isset($url) && $url != '') {
    Director::config()->set('alternate_base_url', (rtrim($url, '/') . '/'));
    Director::config()->set('cookie_path', '/');
}