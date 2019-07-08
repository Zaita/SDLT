<?php
namespace NZTA\SDLT\Traits;
use SilverStripe\Security\Member;
use SilverStripe\Security\Security;
trait SDLTModelPermissions {
    /**
     * Allow logged-in user to access the model
     *
     * @param Member|null $member member
     * @return bool
     */
    public function canView($member = null)
    {
        return (Security::getCurrentUser() !== null);
    }

    public function canCreate($member = null, $context = [])
    {
        if (!$member) {
            $member = Security::getCurrentUser();
        }
        if ($member && $member->inGroup('sdlt-reporters')) {
            return false;
        }

        // Ensure that only a single home is able to be created in the CMS
        if($this instanceof QuestionnaireEmail) {
            return (parent::canCreate($member) && QuestionnaireEmail::get()->Count() === 0);
        }

        return true;
    }

    public function canEdit($member = null)
    {
        if (!$member) {
            $member = Security::getCurrentUser();
        }
        // var_dump($member, $member->inGroup('SDLT Reporters'));die();
        if ($member && $member->inGroup('sdlt-reporters')) {
            return false;
        }
        return true;
    }

    public function canDelete($member = null)
    {
        if (!$member) {
            $member = Security::getCurrentUser();
        }
        if ($member && $member->inGroup('sdlt-reporters')) {
            return false;
        }
        return true;
    }
}
