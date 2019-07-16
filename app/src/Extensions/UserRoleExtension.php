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

use NZTA\SDLT\Constant\UserGroupConstant;
use SilverStripe\ORM\DataExtension;

/**
 * Class UserRoleExtension
 */
class UserRoleExtension extends DataExtension
{
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

    /**
     * Check if the member is a Reporter.
     *
     * @return boolean
     */
    public function getIsReporter()
    {
        return $this->owner
            ->Groups()
            ->filter('Code', UserGroupConstant::GROUP_CODE_REPORTER)
            ->exists();
    }
}
