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

use NZTA\SDLT\Model\QuestionnaireSubmission;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\TextField;
use SilverStripe\ORM\DataExtension;

/**
 * Class UserRoleExtension
 *
 * Add `UserRole` field */
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

    /**
     * Check if the member is a Security Architect
     *
     * @return boolean
     */
    public function getIsSA()
    {
        // SA and CISO can view it
        return $this->owner
            ->Groups()
            ->filter('Code', QuestionnaireSubmission::$security_architect_group_code)
            ->exists();
    }

    /**
     * Check if the member is a Chief Information Security Officer
     *
     * @return boolean
     */
    public function getIsCISO()
    {
        return $this->owner
            ->Groups()
            ->filter('Code', QuestionnaireSubmission::$ciso_group_code)
            ->exists();
    }
}
