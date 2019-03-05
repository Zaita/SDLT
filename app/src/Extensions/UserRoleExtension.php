<?php

/**
 * This file contains the "UserRoleExtension" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Extension;

use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\TextField;
use SilverStripe\ORM\DataExtension;

/**
 * Class UserRoleExtension
 *
 * Add `UserRole` field
 */
class UserRoleExtension extends DataExtension
{
    /**
     * new database fields
     *
     * @var array
     */
    private static $db = [
        'UserRole' => 'Varchar(255)'
    ];

    /**
     * Update CMS fields
     *
     * @param FieldList $fields fields
     * @return void
     */
    public function updateCMSFields(FieldList $fields)
    {
        $fields->addFieldToTab(
            'Root.Main',
            TextField::create("UserRole", "User Role")
        );
    }
}
