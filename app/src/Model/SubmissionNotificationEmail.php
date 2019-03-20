<?php

/**
 * This file contains the "Question" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Model;

use SilverStripe\Forms\FieldList;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\HasManyList;
use SilverStripe\Security\Member;
use SilverStripe\Security\Security;

/**
 * Class Question
 *
 * @property string Title
 * @property string Question
 * @property string Description
 * @property string Type
 *
 * @property Questionnaire Questionnaire
 *
 * @method HasManyList Inputs()
 * @method HasManyList Actions()
 */
class SubmissionNotificationEmail extends DataObject
{
    /**
     * @var string
     */
    private static $table_name = 'SubmissionNotificationEmail';

    /**
     * @var array
     */
    private static $db = [
        'ApprovalGroup' => 'Enum(array("ciso", "security_architect"))',
    ];

    /**
     * @var array
     */
    private static $has_one = [
        'Member' => Member::class,
        'Questionnaire' => Questionnaire::class
    ];

    /**
     * @var array
     */
    private static $summary_fields = [
        'getMemberName' => 'Member Name',
        'getMemberEmail' => 'Member Email',
        'ApprovalGroup' => 'Approval Group'
    ];

    /**
     * @return string
     */
    public function getMemberName()
    {
        return $this->Member()->Name;
    }

    /**
     * @return string
     */
    public function getMemberEmail()
    {
        return $this->Member()->Email;
    }

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
}
