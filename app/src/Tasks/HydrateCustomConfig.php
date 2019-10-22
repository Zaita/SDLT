<?php

/**
 * This file contains the "HydrateCustomConfig" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright 2019 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Tasks;

use SilverStripe\Dev\BuildTask;
use SilverStripe\Control\HTTPRequest;
use SilverStripe\SiteConfig\SiteConfig;
use SilverStripe\Control\Director;
use SilverStripe\Security\InheritedPermissions;

/**
 * Run this task to pre-configure an SDLT instance with some custom defaults.
 * To change the defaults, developers should amend the following file: app/_config/customisation.yml
 */
class HydrateCustomConfig extends BuildTask
{
    /**
     * @var string
     */
    private static $segment = 'HydrateCustomConfig';

    /**
     * @var string
     */
    public $title = 'Initial setup of SDLT customisations';

    /**
     * @var string
     */
    public $description = 'This task will pre-configure the SDLT with instance-specific defaults.';

    /**
     * Default "run" method, required when implementing all {@Link BuildTask} instances.
     *
     * @param  HTTPRequest $request Default parameter
     * @return void
     */
    public function run($request) : void
    {
        echo self::log_to_screen('Starting customisations...', 2);

        $siteConfig = SiteConfig::current_site_config();

        if ($this->config()->get('login_prompt') === true) {
            $siteConfig->CanViewType = InheritedPermissions::LOGGED_IN_USERS;

            // Use FQCN so PHP doesn't choke attempting to import non-existant class
            if (class_exists(\SilverStripe\CMS\Model\SiteTree::class)) {
                foreach (\SilverStripe\CMS\Model\SiteTree::get() as $page) {
                    $page->CanViewType = InheritedPermissions::LOGGED_IN_USERS;
                    $page->write();
                    $page->publishRecursive();
                }
            }
        }

        $siteConfig->write();

        echo self::log_to_screen('Done!');
    }

    /**
     * Simple on-screen reporter.
     *
     * @param  string $message
     * @param  int    $numLines
     * @return string
     */
    public static function log_to_screen(string $message, int $numLines = 1) : string
    {
        $le = Director::is_cli() ? PHP_EOL : '<br/>';

        return sprintf('%s%s', $message, str_repeat($le, $numLines));
    }
}
