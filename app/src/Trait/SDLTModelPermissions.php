<?php

/**
 * This file contains the "UserRoleExtension" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright NZ Transport Agency
 * @license BSD-3
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Traits;

use SilverStripe\Security\Member;
use SilverStripe\Security\Security;

trait SDLTModelPermissions
{
    /**
     * Allow logged-in user to access the model
     *
     * @param  Member|null $member member
     * @return bool
     */
    public function canView($member = null)
    {
        return (Security::getCurrentUser() !== null);
    }

    /**
     * Allow logged-in user to create an instance of the model
     *
     * @param  Member|null $member member
     * @param  array       $context (Inherited)
     * @return bool
     */
    public function canCreate($member = null, $context = [])
    {
        if (!$member) {
            $member = Security::getCurrentUser();
        }

        if ($member && $member->getIsReporter()) {
            return false;
        }

        // Ensure that only a single home is able to be created in the CMS
        if ($this instanceof QuestionnaireEmail) {
            return (parent::canCreate($member) && QuestionnaireEmail::get()->Count() === 0);
        }

        return true;
    }

    /**
     * Allow logged-in user to edit an instance of the model
     *
     * @param  Member|null $member member
     * @return bool
     */
    public function canEdit($member = null)
    {
        if (!$member) {
            $member = Security::getCurrentUser();
        }

        if ($member && $member->getIsReporter()) {
            return false;
        }

        return true;
    }

    /**
     * Allow logged-in user to delete an instance of the model
     *
     * @param  Member|null $member member
     * @return bool
     */
    public function canDelete($member = null)
    {
        if (!$member) {
            $member = Security::getCurrentUser();
        }

        if ($member && $member->getIsReporter()) {
            return false;
        }

        return true;
    }
}
