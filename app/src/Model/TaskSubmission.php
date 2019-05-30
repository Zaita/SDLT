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

use Exception;
use GraphQL\Type\Definition\ResolveInfo;
use NZTA\SDLT\Constant\UserGroupConstant;
use NZTA\SDLT\GraphQL\GraphQLAuthFailure;
use Ramsey\Uuid\Uuid;
use SilverStripe\Forms\DatetimeField;
use SilverStripe\Forms\FieldList;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ResolverInterface;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\DataObjectScaffolder;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\HasManyList;
use SilverStripe\Security\Member;
use SilverStripe\Security\Security;
use NZTA\SDLT\Validation\QuestionnaireValidation;
use SilverStripe\Core\Convert;
use SilverStripe\Control\Director;
use Symbiote\QueuedJobs\Services\QueuedJobService;
use NZTA\SDLT\Job\SendTaskSubmissionEmailJob;
use SilverStripe\Forms\TextField;
use NZTA\SDLT\Helper\JIRA;
use NZTA\SDLT\Model\JiraTicket;

/**
 * Class TaskSubmission
 *
 * @property string QuestionnaireData
 * @property string AnswerData
 * @property string Status
 * @property string UUID
 * @property string Result
 * @property string SecureToken
 * @property int SubmitterID
 * @property int TaskID
 * @property int QuestionnaireSubmissionID
 * @property boolean LockAnswersWhenComplete
 * @property string SubmitterIPAddress
 * @property string CompletedAt
 * @property string JiraKey
 *
 * @method Member Submitter()
 * @method Task Task()
 * @method QuestionnaireSubmission QuestionnaireSubmission()
 * @method HasManyList SelectedComponents()
 * @method HasManyList JiraTickets()
 */
class TaskSubmission extends DataObject implements ScaffoldingProvider
{
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETE = 'complete';
    const STATUS_INVALID = 'invalid';

    /**
     * @var string
     */
    private static $table_name = 'TaskSubmission';

    /**
     * @var array
     */
    private static $db = [
        'QuestionnaireData' => 'Text', // store in JSON format
        'AnswerData' => 'Text', // store in JSON format
        'Status' => 'Enum(array("in_progress", "complete", "invalid"))',
        'UUID' => 'Varchar(255)',
        'Result' => 'Varchar(255)',
        'SecureToken' => 'Varchar(64)',
        'LockAnswersWhenComplete' => 'Boolean',
        'SubmitterIPAddress' => 'Varchar(255)',
        'CompletedAt' => 'Datetime',
        'SendEmailAfterSubmission' => 'Boolean',
        'EmailRelativeLinkToTask' => 'Varchar(255)',
        'JiraKey' => 'Varchar(255)'
    ];

    /**
     * @var array
     */
    private static $has_one = [
        'Submitter' => Member::class,
        'Task' => Task::class,
        'QuestionnaireSubmission' => QuestionnaireSubmission::class
    ];

    /**
     * @var array
     */
    private static $has_many = [
        'JiraTickets' => JiraTicket::class
    ];

    /**
     * @var array
     */
    private static $many_many = [
        'SelectedComponents' => SecurityComponent::class,
    ];

    /**
     * @var array
     */
    private static $summary_fields = [
        'ID',
        'UUID',
        'Task.Name' => 'Task Name',
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
     * @return string
     */
    public function getTaskName()
    {
        $task = $this->Task();
        if (!$task->exists()) {
            return "";
        }
        return $task->Name;
    }

    /**
     * @return string
     */
    public function getTaskType()
    {
        $task = $this->Task();
        if (!$task->exists()) {
            return "";
        }
        return $task->TaskType;
    }

    /**
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        if (!$this->CompletedAt) {
            $fields->removebyName('CompletedAt');
        } else {
            /* @var $completedAtField DatetimeField */
            $completedAtField = $fields->dataFieldByName('CompletedAt');
            $completedAtField
                ->setHTML5(false)
                // ->setDatetimeFormat('yyyy-MM-dd HH:mm:ss')
                ->setDatetimeFormat('dd/MM/yyyy hh:mm a')
                ->setReadonly(true)
                ->setDescription(null);
        }


        $secureLink = $this->SecureLink();
        $anonLink = $this->AnonymousAccessLink();
        $fields->addFieldsToTab('Root.Links', [
            TextField::create(microtime(), 'Secure link')
                ->setValue($secureLink)
                ->setReadonly(true)
                ->setDescription('This is the link emailed to authenticated'
                    .' users of the application'),
            TextField::create(microtime(), 'Anonymous access link')
                ->setValue($anonLink)
                ->setReadonly(true)
                ->setDescription('This is the link emailed to anonymous users'
                    .' of the application. Anyone possessing the link can view'
                    .' the submission')
        ]);

        return $fields;
    }

    /**
     * @param SchemaScaffolder $scaffolder The scaffolder of the schema
     *
     * @return void
     */
    public function provideGraphQLScaffolding(SchemaScaffolder $scaffolder)
    {
        $dataObjectScaffolder = $this->provideGraphQLScaffoldingForEntityType($scaffolder);
        $this->provideGraphQLScaffoldingForCreateTaskSubmission($scaffolder);
        $this->provideGraphQLScaffoldingForUpdateTaskSubmission($scaffolder);
        $this->provideGraphQLScaffoldingForCompleteTaskSubmission($scaffolder);
        $this->provideGraphQLScaffoldingForEditTaskSubmission($scaffolder);
        $this->provideGraphQLScaffoldingForUpdateTaskSubmissionWithSelectedComponents($scaffolder);
        $this->provideGraphQLScaffoldingForReadTaskSubmission($dataObjectScaffolder);
    }

    /**
     * @param SchemaScaffolder $scaffolder The scaffolder of the schema
     * @return DataObjectScaffolder
     */
    private function provideGraphQLScaffoldingForEntityType(SchemaScaffolder $scaffolder)
    {
        $dataObjectScaffolder = $scaffolder
            ->type(TaskSubmission::class)
            ->addFields([
                'ID',
                'UUID',
                'QuestionnaireData',
                'AnswerData',
                'Status',
                'Result',
                'Submitter',
                'TaskName',
                'TaskType',
                'QuestionnaireSubmission',
                'LockAnswersWhenComplete',
                'JiraKey',
            ]);

        $dataObjectScaffolder
            ->nestedQuery('SelectedComponents')
            ->setUsePagination(false)
            ->end();

        $dataObjectScaffolder
            ->nestedQuery('JiraTickets')
            ->setUsePagination(false)
            ->end();

        return $dataObjectScaffolder;
    }

    /**
     * @param SchemaScaffolder $scaffolder The scaffolder of the schema
     * @return void
     */
    private function provideGraphQLScaffoldingForCreateTaskSubmission(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('createTaskSubmission', TaskSubmission::class)
            ->addArgs([
                'TaskID' => 'String!',
                'QuestionnaireSubmissionID' => 'String!'
            ])
            ->setResolver(new class implements ResolverInterface
            {
                /**
                 * Invoked by the Executor class to resolve this mutation / query
                 * @see Executor
                 *
                 * @param mixed       $object  object
                 * @param array       $args    args
                 * @param mixed       $context context
                 * @param ResolveInfo $info    info
                 * @throws Exception
                 * @return mixed
                 */
                public function resolve($object, array $args, $context, ResolveInfo $info)
                {
                    // Check authentication
                    QuestionnaireValidation::is_user_logged_in();

                    $taskID = (int)$args['TaskID'];
                    $questionnaireSubmissionID = (int)$args['QuestionnaireSubmissionID'];
                    $submitterID = (int)Security::getCurrentUser()->ID;

                    if (!$taskID || !$questionnaireSubmissionID || !$submitterID) {
                        throw new Exception('Invalid arguments');
                    }

                    $questionnaireSubmission = QuestionnaireSubmission::get_by_id($questionnaireSubmissionID);
                    if (!$questionnaireSubmission->exists()) {
                        throw new Exception('Questionnaire submission does not exist');
                    }
                    if ((int)$questionnaireSubmission->User()->ID !== $submitterID) {
                        throw new Exception('Questionnaire submission does not belong to you');
                    }

                    $taskSubmission = TaskSubmission::create_task_submission(
                        $taskID,
                        $questionnaireSubmissionID,
                        $submitterID
                    );
                }
            })
            ->end();
    }

    /**
     * When the user submit a questionnaire, the system will generate task submissions by calling this method
     *
     * @param string|int $taskID                    The task ID
     * @param string|int $questionnaireSubmissionID The questionnaire submission ID
     * @param int        $submitterID               The submitter ID
     * @return TaskSubmission
     * @throws Exception
     */
    public static function create_task_submission($taskID, $questionnaireSubmissionID, $submitterID)
    {
        $task = Task::get_by_id($taskID);
        if (!$task || !$task->exists()) {
            throw new Exception('Task does not exist');
        }

        // Avoid creating duplicated task submission: invalid the existing one first
        /* @var $existingTaskSubmission TaskSubmission */
        $existingTaskSubmission = TaskSubmission::get()
            ->filter([
                'TaskID' => $taskID,
                'QuestionnaireSubmissionID' => $questionnaireSubmissionID,
                'SubmitterID' => $submitterID
            ])
            ->first();
        if ($existingTaskSubmission && $existingTaskSubmission->exists()) {
            $existingTaskSubmission->Status = TaskSubmission::STATUS_INVALID;
            $existingTaskSubmission->write();
        }

        // Turn "invalid" task submission into "progress" if applicable rather than create new ones
        /* @var $invalidTaskSubmission TaskSubmission|null */
        $invalidTaskSubmission = TaskSubmission::get()
            ->filter([
                'Status' => TaskSubmission::STATUS_INVALID,
                'TaskID' => $taskID,
                'QuestionnaireSubmissionID' => $questionnaireSubmissionID,
                'SubmitterID' => $submitterID
            ])
            ->first();
        if ($invalidTaskSubmission && $invalidTaskSubmission->exists()) {
            // Only turn "invalid" task submissions back if the structure is not changed
            if (json_encode($task->getQuestionsData()) == $invalidTaskSubmission->QuestionnaireData) {
                $invalidTaskSubmission->Status = TaskSubmission::STATUS_IN_PROGRESS;
                $invalidTaskSubmission->write();
                return $invalidTaskSubmission;
            }
        }

        // Create new task submission
        $taskSubmission = TaskSubmission::create();

        // Relations
        $taskSubmission->TaskID = $taskID;
        $taskSubmission->QuestionnaireSubmissionID = $questionnaireSubmissionID;
        $taskSubmission->SubmitterID = $submitterID;

        // Structure of task questionnaire
        $questionnaireData = $task->getQuestionsData();
        $taskSubmission->QuestionnaireData = json_encode($questionnaireData);

        // Initial status of the submission
        $taskSubmission->Status = TaskSubmission::STATUS_IN_PROGRESS;
        $taskSubmission->LockAnswersWhenComplete = $task->LockAnswersWhenComplete;

        $taskSubmission->write();

        // after submit the questionnaire, please send a summary page link
        // to the submitter
        $queuedJobService = QueuedJobService::create();

        $queuedJobService->queueJob(
            new SendTaskSubmissionEmailJob($taskSubmission, [Security::getCurrentUser()]),
            date('Y-m-d H:i:s', time() + 30)
        );

        return $taskSubmission;
    }

    /**
     * @param SchemaScaffolder $scaffolder The scaffolder of the schema
     * @return void
     */
    private function provideGraphQLScaffoldingForUpdateTaskSubmission(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('updateTaskSubmission', TaskSubmission::class)
            ->addArgs([
                'UUID' => 'String!',
                'QuestionID' => 'ID!',
                'AnswerData' => 'String',
                'SecureToken' => 'String',
            ])
            ->setResolver(new class implements ResolverInterface
            {
                /**
                 * Invoked by the Executor class to resolve this mutation / query
                 * @see Executor
                 *
                 * @param mixed       $object  object
                 * @param array       $args    args
                 * @param mixed       $context context
                 * @param ResolveInfo $info    info
                 * @throws Exception
                 * @return mixed
                 */
                public function resolve($object, array $args, $context, ResolveInfo $info)
                {
                    if (empty($args['UUID']) || empty($args['QuestionID']) ||empty($args['AnswerData'])) {
                        throw new Exception('Please enter a valid argument data.');
                    }

                    $member = Security::getCurrentUser();
                    $uuid = Convert::raw2sql($args['UUID']);
                    $secureToken = isset($args['SecureToken']) ? Convert::raw2sql(trim($args['SecureToken'])) : null;

                    $submission = TaskSubmission::get_task_submission_by_uuid($uuid);

                    $canEdit = TaskSubmission::can_edit_task_submission(
                        $submission,
                        $member,
                        $secureToken
                    );
                    if (!$canEdit) {
                        throw new GraphQLAuthFailure();
                    }

                    // AnswerData is generated by `window.btoa(JSON.stringify(answerData))` in JavaScript
                    // This is to avoid parsing issue caused by `quote`, `\n` and other special characters
                    $questionAnswerData = json_decode(base64_decode($args['AnswerData']));

                    if (is_null($questionAnswerData)) {
                        throw new Exception('data is not a vaild json object.');
                    }

                    // Validate answer data
                    do {
                        // If there is no answer or not applicable, don't validate it
                        // Scenario: only use this API to save "current" and "applicable" flag
                        if ((bool)($questionAnswerData->hasAnswer) === false) {
                            break;
                        }
                        if ((bool)($questionAnswerData->isApplicable) === false) {
                            break;
                        }

                        if ($questionAnswerData->answerType == "input") {
                            //var_dump($questionAnswerData->answerType);
                            // validate input field data
                            QuestionnaireValidation::validate_answer_input_data($questionAnswerData->inputs, $submission->QuestionnaireData, $args['QuestionID']);
                        }

                        if ($questionAnswerData->answerType == "action") {
                            //validate action field
                            QuestionnaireValidation::validate_answer_action_data($questionAnswerData->actions, $submission->QuestionnaireData, $args['QuestionID']);
                        }
                    } while (false);

                    $answerDataArr = [];

                    if (!empty($submission->AnswerData)) {
                        $answerDataArr = json_decode($submission->AnswerData, true);
                    }

                    $answerDataArr[$args['QuestionID']] = $questionAnswerData;

                    // if everything is ok, then please add/update AnswerData
                    $allAnswerData = json_decode($submission->AnswerData, true);
                    $allAnswerData[$args['QuestionID']] = $questionAnswerData;
                    $submission->AnswerData = json_encode($allAnswerData);

                    $submission->write();

                    return $submission;
                }
            })
            ->end();
    }

    /**
     * @param SchemaScaffolder $scaffolder The scaffolder of the schema
     * @return void
     */
    private function provideGraphQLScaffoldingForCompleteTaskSubmission(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('completeTaskSubmission', TaskSubmission::class)
            ->addArgs([
                'UUID' => 'String!',
                'Result' => 'String',
                'SecureToken' => 'String'
            ])
            ->setResolver(new class implements ResolverInterface
            {
                /**
                 * Invoked by the Executor class to resolve this mutation / query
                 * @see Executor
                 *
                 * @param mixed       $object  object
                 * @param array       $args    args
                 * @param mixed       $context context
                 * @param ResolveInfo $info    info
                 * @throws GraphQLAuthFailure
                 * @return mixed
                 */
                public function resolve($object, array $args, $context, ResolveInfo $info)
                {
                    $member = Security::getCurrentUser();
                    $uuid = Convert::raw2sql($args['UUID']);
                    $secureToken = isset($args['SecureToken']) ? Convert::raw2sql(trim($args['SecureToken'])) : null;

                    $submission = TaskSubmission::get_task_submission_by_uuid($uuid);

                    $canEdit = TaskSubmission::can_edit_task_submission(
                        $submission,
                        $member,
                        $secureToken
                    );
                    if (!$canEdit) {
                        throw new GraphQLAuthFailure();
                    }

                    $submission->Status = TaskSubmission::STATUS_COMPLETE;

                    if ($_SERVER['REMOTE_ADDR']) {
                        $submission->SubmitterIPAddress = Convert::raw2sql($_SERVER['REMOTE_ADDR']);
                    }
                    $submission->CompletedAt = date('Y-m-d H:i:s');

                    // TODO: validate based on answer
                    if (isset($args['Result'])) {
                        $submission->Result = trim($args['Result']);
                    }

                    $submission->write();

                    return $submission;
                }
            })
            ->end();
    }

    /**
     * @param SchemaScaffolder $scaffolder The scaffolder of the schema
     * @return void
     */
    private function provideGraphQLScaffoldingForEditTaskSubmission(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('editTaskSubmission', TaskSubmission::class)
            ->addArgs([
                'UUID' => 'String!',
                'SecureToken' => 'String',
            ])
            ->setResolver(new class implements ResolverInterface
            {
                /**
                 * Invoked by the Executor class to resolve this mutation / query
                 * @see Executor
                 *
                 * @param mixed       $object  object
                 * @param array       $args    args
                 * @param mixed       $context context
                 * @param ResolveInfo $info    info
                 * @throws GraphQLAuthFailure
                 * @return mixed
                 */
                public function resolve($object, array $args, $context, ResolveInfo $info)
                {
                    $member = Security::getCurrentUser();
                    $uuid = Convert::raw2sql($args['UUID']);
                    $secureToken = isset($args['SecureToken']) ? Convert::raw2sql(trim($args['SecureToken'])) : null;

                    $submission = TaskSubmission::get_task_submission_by_uuid($uuid);

                    $canEdit = TaskSubmission::can_edit_task_submission(
                        $submission,
                        $member,
                        $secureToken
                    );
                    if (!$canEdit) {
                        throw new GraphQLAuthFailure();
                    }

                    $submission->Status = TaskSubmission::STATUS_IN_PROGRESS;
                    $submission->SubmitterIPAddress = null;
                    $submission->CompletedAt = null;
                    $submission->Result = null;
                    $submission->write();

                    return $submission;
                }
            })
            ->end();
    }

    /**
     * @param DataObjectScaffolder $scaffolder The scaffolder of the data object
     * @return void
     */
    private function provideGraphQLScaffoldingForReadTaskSubmission(DataObjectScaffolder $scaffolder)
    {
        $scaffolder
            ->operation(SchemaScaffolder::READ)
            ->setName('readTaskSubmission')
            ->addArg('UUID', 'String!')
            ->addArg('SecureToken', 'String')
            ->setUsePagination(false)
            ->setResolver(new class implements ResolverInterface
            {

                /**
                 * Invoked by the Executor class to resolve this mutation / query
                 * @see Executor
                 *
                 * @param mixed       $object  object
                 * @param array       $args    args
                 * @param mixed       $context context
                 * @param ResolveInfo $info    info
                 * @throws Exception
                 * @return mixed
                 */
                public function resolve($object, array $args, $context, ResolveInfo $info)
                {
                    $member = Security::getCurrentUser();
                    $uuid = Convert::raw2sql($args['UUID']);
                    $secureToken = isset($args['SecureToken']) ? Convert::raw2sql(trim($args['SecureToken'])) : null;

                    // Check argument
                    if (!$uuid) {
                        throw new Exception('Wrong argument');
                    }

                    // Filter data by UUID
                    /* @var $data TaskSubmission */
                    $data = TaskSubmission::get()
                        ->filter(['UUID' => $uuid])
                        ->exclude('Status', TaskSubmission::STATUS_INVALID)
                        ->first();

                    $canView = TaskSubmission::can_view_task_submission(
                        $data,
                        $member,
                        $secureToken
                    );

                    if (!$canView) {
                        throw new GraphQLAuthFailure();
                    }

                    return $data;
                }
            })
            ->end();
    }

    /**
     * check does task belong to log in user
     *
     * @throws Exception
     * @return void
     */
    public function doesTaskSubmissionBelongToCurrentUser()
    {
        $member = Security::getCurrentUser();

        if ((int)($member->ID) !== (int)($this->SubmitterID)) {
            throw new Exception('Sorry Task Submission does not belong to login user.');
        }
    }

    /**
     * check does task submission Exist
     *
     * @param string $uuid uuid
     *
     * @throws Exception
     * @return TaskSubmission
     */
    public static function get_task_submission_by_uuid($uuid = null)
    {
        // Check argument
        if (!$uuid) {
            throw new Exception('Please enter a valid UUID.');
        }

        /* @var $submission TaskSubmission */
        $submission = TaskSubmission::get()->find('UUID', $uuid);

        if (!$submission) {
            throw new Exception('Task submission does not exist');
        }

        return $submission;
    }

    /**
     * @param TaskSubmission $taskSubmission The task submission
     * @param Member|null    $member         The member
     * @param string         $secureToken    The secure token
     * @return bool
     */
    public static function can_view_task_submission($taskSubmission, $member = null, $secureToken = '')
    {
        if (!$taskSubmission) {
            return false;
        }

        // If logged in
        if ($member) {
            // Submitter can view it
            if ((int)$taskSubmission->SubmitterID === (int)$member->ID) {
                return true;
            }

            // SA and CISO can view it
            $isSA = $member->Groups()->filter('Code', UserGroupConstant::GROUP_CODE_SA)->exists();
            $isCISO = $member->Groups()->filter('Code', UserGroupConstant::GROUP_CODE_CISO)->exists();
            if ($isSA || $isCISO) {
                return true;
            }
        }

        // Correct SecureToken can view it
        if ($taskSubmission->SecureToken && @hash_equals($taskSubmission->SecureToken, $secureToken)) {
            return true;
        }

        // Correct ApprovalLinkToken can view it
        if ($taskSubmission->QuestionnaireSubmission()->exists() &&
            $taskSubmission->QuestionnaireSubmission()->ApprovalLinkToken &&
            @hash_equals($taskSubmission->QuestionnaireSubmission()->ApprovalLinkToken, $secureToken)
        ) {
            return true;
        }

        // Others can not view it
        return false;
    }

    /**
     * @param TaskSubmission $taskSubmission The task submission
     * @param Member|null    $member         The member
     * @param string         $secureToken    The secure token
     * @return bool
     */
    public static function can_edit_task_submission($taskSubmission, $member = null, $secureToken = '')
    {
        if (!$taskSubmission) {
            return false;
        }

        // A logged-in user will be judged by its role
        if ($member) {
            $isSubmitter = (int)$taskSubmission->SubmitterID === (int)$member->ID;
            $isSA = $member
                ->Groups()
                ->filter('Code', UserGroupConstant::GROUP_CODE_SA)
                ->exists();

            // Submitter can edit when answers are not locked
            if ($isSubmitter) {
                if ($taskSubmission->Status === TaskSubmission::STATUS_IN_PROGRESS) {
                    return true;
                }
                if ($taskSubmission->Status === TaskSubmission::STATUS_COMPLETE) {
                    if (!$taskSubmission->LockAnswersWhenComplete) {
                        return true;
                    }
                }
            }

            // SA can edit it
            if ($isSA) {
                return true;
            }
        }

        // Any user with correct SecureToken can edit when answers are not locked
        if ($taskSubmission->SecureToken && @hash_equals($taskSubmission->SecureToken, $secureToken)) {
            if ($taskSubmission->Status === TaskSubmission::STATUS_IN_PROGRESS) {
                return true;
            }
            if ($taskSubmission->Status === TaskSubmission::STATUS_COMPLETE) {
                if (!$taskSubmission->LockAnswersWhenComplete) {
                    return true;
                }
            }
        }

        // Disallow editing in other cases
        return false;
    }

    /**
     * onbeforewrite
     *
     * @return void
     */
    public function onBeforeWrite()
    {
        parent::onBeforeWrite();

        if (!$this->UUID) {
            $this->UUID = (string) Uuid::uuid4();
        }

        if (!$this->SecureToken) {
            $this->SecureToken = hash('sha3-256', random_bytes(64));
        }
    }

    /**
     * Display a link to the task submission.
     * This also generates an email link, which always sures the submission is
     * routed properly in case the user is not logged in when receiving the
     * email
     *
     * Not used directly, it's only for generating SecureLink or AnonymousAccessLink
     *
     * @return string
     */
    public function Link()
    {
        if ($this->Task()->TaskType == 'selection') {
            return "#/component-selection/submission/{$this->UUID}";
        }
        return '#/task/submission/' . $this->UUID;
    }

    /**
     * Check login status first before viewing the task submission
     *
     * @return void
     */
    public function SecureLink()
    {
        $route = $this->Link();
        $secureLink = 'Security/login/?BackURL='.rawurlencode($route);

        return Director::absoluteBaseURL() . $secureLink;
    }

    /**
     * Anonymous access link
     * Allows vendors to login to view the task with a secure token
     *
     * @param string $prefix controller route to follow that grants user access
     *                       for GCIO105, this is 'vendorApp'
     * @return void
     */
    public function AnonymousAccessLink($prefix = 'vendorApp')
    {
        if (strlen($prefix) > 0) {
            $anonLink = sprintf(
                "%s/%s?token=%s",
                $prefix,
                $this->Link(),
                $this->SecureToken
            );

            return Director::absoluteBaseURL() . $anonLink;
        }
    }

    /**
     * @param SchemaScaffolder $scaffolder scaffolder
     * @return void
     */
    private function provideGraphQLScaffoldingForUpdateTaskSubmissionWithSelectedComponents(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('updateTaskSubmissionWithSelectedComponents', TaskSubmission::class)
            ->addArgs([
                'UUID' => 'String!',
                'ComponentIDs' => 'String!',
                'JiraKey' => 'String!'
            ])
            ->setResolver(new class implements ResolverInterface
            {
                /**
                 * Invoked by the Executor class to resolve this mutation / query
                 * @see Executor
                 *
                 * @param mixed       $object  object
                 * @param array       $args    args
                 * @param mixed       $context context
                 * @param ResolveInfo $info    info
                 * @throws Exception
                 * @return mixed
                 */
                public function resolve($object, array $args, $context, ResolveInfo $info)
                {
                    /* @var $submission TaskSubmission */
                    $submission = TaskSubmission::get()
                        ->filter(['UUID' => Convert::raw2sql($args['UUID'])])
                        ->first();
                    if (!$submission || !$submission->exists()) {
                        throw new Exception('Task submission with the given UUID can not be found');
                    }

                    $componentIDs = json_decode(base64_decode($args['ComponentIDs']), true);

                    $components = [];
                    $submission->SelectedComponents()->removeAll();
                    foreach ($componentIDs as $componentID) {
                        $component = SecurityComponent::get_by_id(Convert::raw2sql($componentID));
                        if ($component) {
                            $components[] = $component;
                            $submission->SelectedComponents()->add($component);
                        }
                    }

                    if (!$components) {
                        throw new Exception('No components have been selected');
                    }

                    $submission->JiraKey = Convert::raw2sql($args['JiraKey']);
                    $submission->write();

                    foreach ($components as $component) {
                            $jiraTicket = JiraTicket::create();
                            $jiraTicket->JiraKey = Convert::raw2sql($args['JiraKey']);
                            $link = JIRA::create()->addTask(
                                $jiraTicket->JiraKey,
                                $component->Name,
                                $component->getJIRABody()
                            );
                            $jiraTicket->TicketLink = $link;
                            $jiraTicket->write();
                            $submission->JiraTickets()->add($jiraTicket);
                    }

                    return $submission;
                }
            })
            ->end();
    }

    /**
     * Event handler called after writing to the database.
     * @return void
     */
    public function onAfterWrite()
    {
        parent::onAfterWrite();

        $changed = $this->getChangedFields(['Status'], 1);

        if (array_key_exists('Status', $changed) &&
            $changed['Status']['before'] == 'complete' &&
            $changed['Status']['after'] == 'in_progress') {
            $this->QuestionnaireSubmission()->QuestionnaireStatus = 'submitted';
            $this->QuestionnaireSubmission()->write();
        }
    }
}
