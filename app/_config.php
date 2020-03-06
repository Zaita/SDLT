<?php
/**
 * This file contains the global app configuration settings
 * These are often configuration settings which cannot be passed into Config or
 * be activated from within a class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright NZ Transport Agency
 * @license BSD-3
 * @link https://www.catalyst.net.nz
 */

use SilverStripe\CampaignAdmin\CampaignAdmin;
use SilverStripe\Admin\CMSMenu;
use SilverStripe\Reports\ReportAdmin;

CMSMenu::remove_menu_class(CampaignAdmin::class);
CMSMenu::remove_menu_class(ReportAdmin::class);
