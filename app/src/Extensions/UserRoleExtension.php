<?php

/**
 * This file contains the "UserRoleExtension" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T.
 * @copyright 2019 New Zealand Transport Agency
 * @license https://nzta.govt.nz (BSD-3)
 * @link https://nzta.govt.nz
 */

namespace NZTA\SDLT\Extension;

use NZTA\SDLT\Constant\UserGroupConstant;
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
            ->filter('Code', UserGroupConstant::GROUP_CODE_SA)
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
            ->filter('Code', UserGroupConstant::GROUP_CODE_CISO)
            ->exists();
    }
}
