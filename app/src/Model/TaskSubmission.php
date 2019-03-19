<?php

/**
 * This file contains the "TaskSubmission" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Model;

use SilverStripe\ORM\DataObject;
use SilverStripe\Security\Member;
use SilverStripe\Security\Security;

/**
 * Class TaskSubmission
 *
 * @property string SubmitterName
 * @property string SubmitterRole
 * @property string SubmitterEmail
 * @property string QuestionnaireData
 * @property string AnswerData
 * @property string Status
 * @property string UUID
 * @property string Result
 *
 * @method Member User()
 * @method Task Task()
 */
class TaskSubmission extends DataObject
{
    /**
     * @var string
     */
    private static $table_name = 'TaskSubmission';

    /**
     * @var array
     */
    private static $db = [
        'SubmitterName' => 'Varchar(255)',
        'SubmitterRole' => 'Varchar(255)',
        'SubmitterEmail' => 'Varchar(255)',
        'QuestionnaireData' => 'Text', // store in JSON format
        'AnswerData' => 'Text', // store in JSON format
        'Status' => 'Enum(array("in_progress", "complete"))',
        'UUID' => 'Varchar(255)',
        'Result' => 'Varchar(255)'
    ];

    /**
     * @var array
     */
    private static $has_one = [
        'User' => Member::class,
        'Task' => Task::class,
        'QuestionnaireSubmission' => QuestionnaireSubmission::class
    ];

    /**
     * @var array
     */
    private static $summary_fields = [
        'UUID',
        'getTaskName' => 'Task Name',
        'SubmitterName',
        'SubmitterRole',
        'SubmitterEmail',
        'Status',
        'Result',
        'Created' => 'Created date',
    ];

    /**
     * Default sort ordering
     * @var array
     */
    private static $default_sort = ['ID' => 'DESC'];

    /**
     * @return string
     */
    public function getTaskName()
    {
        return $this->Task()->Name;
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

    /**
     * When the user submit a questionnaire, the system will generate task submissions by calling this method
     *
     * @param $taskID string|int The task ID
     * @param $questionnaireSubmissionID string|int The questionnaire submission ID
     * @param $member Member The user
     */
    public static function createTaskSubmission($taskID, $questionnaireSubmissionID, $member) {
        // TODO:
    }
}
