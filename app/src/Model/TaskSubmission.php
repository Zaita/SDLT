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
use NZTA\SDLT\Job\SendTaskApprovalLinkEmailJob;
use SilverStripe\Forms\TextField;
use NZTA\SDLT\Model\JiraTicket;
use SilverStripe\Security\Group;
use NZTA\SDLT\Traits\SDLTRiskSubmission;
use NZTA\SDLT\Helper\SecurityRiskAssessmentCalculator;
use SilverStripe\Forms\HeaderField;
use SilverStripe\Forms\LiteralField;
use SilverStripe\Forms\TextareaField;
use SilverStripe\Forms\ToggleCompositeField;
use SilverStripe\SiteConfig\SiteConfig;
use SilverStripe\Forms\DropdownField;
use SilverStripe\Forms\GridField\GridFieldAddExistingAutocompleter;
use SilverStripe\Forms\GridField\GridFieldAddNewButton;

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
    use SDLTRiskSubmission;

    const STATUS_START = 'start';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETE = 'complete';
    const STATUS_INVALID = 'invalid';
    const STATUS_APPROVED = 'approved';
    const STATUS_DENIED = 'denied';
    const STATUS_WAITING_FOR_APPROVAL = 'waiting_for_approval';
    const STATUS_EXPIRED = 'expired';

    /**
     * @var string
     */
    private static $table_name = 'TaskSubmission';

    /**
     * @var string
     */
    private $cvaTaskDataSource;

    /**
     * @var string
     */
    private $securityRiskAssessmentData = '';

    /**
     * @var array
     */
    private static $db = [
        'QuestionnaireData' => 'Text', // store in JSON format
        'AnswerData' => 'Text', // store in JSON format
        'Status' => 'Enum(array("start", "in_progress", "complete", "waiting_for_approval", "approved", "denied", "invalid", "expired"))',
        'UUID' => 'Varchar(255)',
        'Result' => 'Varchar(255)',
        'SecureToken' => 'Varchar(64)',
        'LockAnswersWhenComplete' => 'Boolean',
        'SubmitterIPAddress' => 'Varchar(255)',
        'CompletedAt' => 'Datetime',
        'EmailRelativeLinkToTask' => 'Varchar(255)',
        'JiraKey' => 'Varchar(255)',
        'IsApprovalRequired' => 'Boolean',
        'IsTaskApprovalLinkSent' => 'Boolean',
        'RiskResultData' => 'Text',
        'CVATaskData' => 'Text',
    ];

    /**
     * @var array
     */
    private static $has_one = [
        'Submitter' => Member::class,
        'TaskApprover' => Member::class,
        'Task' => Task::class,
        'QuestionnaireSubmission' => QuestionnaireSubmission::class,
        'ApprovalGroup' => Group::class
    ];

    /**
     * @var array
     */
    private static $has_many = [
        'JiraTickets' => JiraTicket::class,
        'SelectedComponents' => SelectedComponent::class,
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
        'CompletedAt' => 'Completed Date'
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
    public function getProductAspects()
    {
        return $this->QuestionnaireSubmission()->getProductAspects();
    }

    /**
     * Don't allow to delete records
     *
     * @param Member|null $member member
     * @return bool
     */
    public function canDelete($member = null)
    {
        return false;
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
     * @return string
     */
    public function getComponentTarget()
    {
        $task = $this->Task();

        if (!$task->exists()) {
            return "";
        }

        return $task->ComponentTarget;
    }

    /**
     * @return string
     */
    public function getCVATaskDataSource() : string
    {
        if (!$this->cvaTaskDataSource) {
            $this->setCVATaskDataSource();
        }

        return $this->cvaTaskDataSource;
    }

    /**
     * @param string $dataSource jira/local/default
     * @return string
     */
    public function setCVATaskDataSource($dataSource = 'DefaultComponent')
    {
        $this->cvaTaskDataSource = $dataSource;
    }

    /**
     * Get Security Risk Assessment Data
     *
     * @return string
     */
    public function getSecurityRiskAssessmentData()
    {
        return $this->securityRiskAssessmentData;
    }

    /**
     * @return string
     */
    public function calculateSecurityRiskAssessmentData()
    {
        if ($this->TaskType === 'security risk assessment') {
            $sraCalculator = SecurityRiskAssessmentCalculator::create(
                $this->QuestionnaireSubmission()
            );

            $this->securityRiskAssessmentData = json_encode($sraCalculator->getSRATaskdetails());
        }
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

        // link tab
        $secureLink = $this->SecureLink();
        $anonLink = $this->AnonymousAccessLink();
        $fields->addFieldsToTab(
            'Root.Links',
            [
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
            ]
        );

        $fields->removeByName([
          'RiskResultData',
          'QuestionnaireData',
          'AnswerData',
          'Result',
          'SubmitterID',
          'TaskApproverID'
        ]);

        $fields->addFieldsToTab(
            'Root.TaskSubmissionData',
            [
                ToggleCompositeField::create(
                    'QuestionnaireDataToggle',
                    'Questionnaire Data',
                    [
                        TextareaField::create('QuestionnaireData'),
                    ]
                ),

                ToggleCompositeField::create(
                    'AnswerDataToggle',
                    'Answer Data',
                    [
                        TextareaField::create('AnswerData'),
                    ]
                ),

                ToggleCompositeField::create(
                    'ResultToggle',
                    'Result',
                    [
                        TextField::create('Result'),
                    ]
                ),

            ]
        );

        if ($this->RiskResultData) {
            $riskResultTable = $this->getRiskResultTable();
            if ($riskResultTable) {
                $fields->addFieldsToTab(
                    'Root.TaskSubmissionData',
                    [
                        ToggleCompositeField::create(
                            'ToggleRiskResultData',
                            'Risk Result Data',
                            [
                                TextareaField::create('RiskResultData')
                            ]
                        ),
                        HeaderField::create('RiskResultDataHeader', 'Risk results', 3),
                        LiteralField::create('RiskResultDataTable', $riskResultTable),
                    ]
                );
            }
        }

        $taskApproverList = [];

        if ($approvalGroup = $this->ApprovalGroup()) {
            $taskApproverList = $approvalGroup->Members() ?
                $approvalGroup->Members()->map('ID', 'Name') : $taskApproverList;
        }
        $fields->addFieldsToTab(
            'Root.TaskSubmitter',
            [
                DropdownField::create(
                    'SubmitterID',
                    'Submitter',
                    Member::get()->map('ID', 'Name')
                )->setEmptyString(' '),
                $fields->dataFieldByName('SubmitterIPAddress'),
            ]
        );

        $fields->addFieldsToTab(
            'Root.TaskApproval',
            [
                $fields->dataFieldByName('IsApprovalRequired'),
                DropdownField::create(
                    'TaskApproverID',
                    'Task Approver',
                    $taskApproverList
                )->setEmptyString(' '),
                $fields->dataFieldByName('ApprovalGroupID'),
                $fields->dataFieldByName('IsTaskApprovalLinkSent '),
            ]
        );

        $fields->insertBefore(
            $fields->dataFieldByName('TaskID'),
            'Status'
        );

        $selectedComponentGrid = $fields->dataFieldByName('SelectedComponents');

        if ($selectedComponentGrid) {
            $config = $selectedComponentGrid->getConfig();
            $config->removeComponentsByType(GridFieldAddExistingAutocompleter::class);
            $config->getComponentByType(GridFieldAddNewButton::class)->setButtonName('Add New Component');
        }

        if (!$this->Task()->isRiskType()) {
            $fields->removeByName('RiskResultData');
        }

        $fields->removeByName('QuestionnaireSubmissionID');

        if ($this->Task()->isControlValidationAudit()) {
            $this->getCVA_CMSFields($fields);
        }

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
        $this->provideGraphQLScaffoldingForUpdateTaskSubmissionStatusToApproved($scaffolder);
        $this->provideGraphQLScaffoldingForUpdateTaskSubmissionStatusToDenied($scaffolder);
        $this->provideGraphQLScaffoldingForUpdateControlValidationAuditTaskSubmission($scaffolder);
        $this->provideGraphQLScaffoldingtoReSyncWithJira($scaffolder);
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
                'TaskApprover',
                'TaskName',
                'TaskType',
                'QuestionnaireSubmission',
                'LockAnswersWhenComplete',
                'JiraKey',
                'IsTaskApprovalRequired',
                'IsCurrentUserAnApprover',
                'RiskResultData',
                'ComponentTarget',
                'ProductAspects',
                //you would be forgiven for thinking this returns a TaskSubmission
                //it doesn't. It returns the RiskResultData instead.
                'RiskAssessmentTaskSubmission',
                'CVATaskData',
                'CVATaskDataSource',
                'SecurityRiskAssessmentData',
                'Created'
            ]);

        $dataObjectScaffolder
            ->nestedQuery('SelectedComponents')
            ->setResolver(new class implements ResolverInterface {
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
                    $selectedComponent = $object->SelectedComponents();
                    $productAspect = json_decode($object->ProductAspects);

                    if (!empty($productAspect)) {
                        return $selectedComponent = $selectedComponent->filter([
                            'ProductAspect' => $productAspect
                        ]);
                    }

                    if (empty($productAspect)) {
                        return $selectedComponent = $selectedComponent->filter([
                            'ProductAspect' => null
                        ]);
                    }
                    return $selectedComponent;
                }
            })
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
            ->setResolver(new class implements ResolverInterface {
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
     * @param boolean    $isOldSubmission           true for old submissio which has_one task
     * @return TaskSubmission
     * @throws Exception
     */
    public static function create_task_submission($taskID, $questionnaireSubmissionID, $submitterID, $isOldSubmission)
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

        if ($existingTaskSubmission && ($isOldSubmission ||
            json_encode($task->getQuestionsData()) == $existingTaskSubmission->QuestionnaireData)
        ) {
            // Only turn "in progress" task submissions back if the structure is not changed
            // or if it old submission
            $existingTaskSubmission->Status = TaskSubmission::STATUS_START;

            $existingTaskSubmission->write();

            return $existingTaskSubmission;
        }

        // Create new task submission
        $taskSubmission = TaskSubmission::create();

        // Relations
        $taskSubmission->TaskID = $taskID;
        $taskSubmission->QuestionnaireSubmissionID = $questionnaireSubmissionID;
        $taskSubmission->SubmitterID = $submitterID;
        $taskSubmission->ApprovalGroupID = $task->ApprovalGroup()->ID;

        // Structure of task questionnaire
        $taskSubmission->IsApprovalRequired = $task->IsApprovalRequired;
        $questionnaireData = $task->getQuestionsData();
        $taskSubmission->QuestionnaireData = json_encode($questionnaireData);

        // Initial status of the submission
        $taskSubmission->Status = TaskSubmission::STATUS_START;
        $taskSubmission->LockAnswersWhenComplete = $task->LockAnswersWhenComplete;

        $taskSubmission->write();

        // after create the task questionnaire, please send a start page link
        // to the submitter
        $qs = QueuedJobService::create();

        $qs->queueJob(
            new SendTaskSubmissionEmailJob($taskSubmission),
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
            ->setResolver(new class implements ResolverInterface {
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
                            // validate input field data
                            QuestionnaireValidation::validate_answer_input_data(
                                $questionAnswerData->inputs,
                                $submission->QuestionnaireData,
                                $args['QuestionID']
                            );
                        }

                        if ($questionAnswerData->answerType == "action") {
                            //validate action field
                            QuestionnaireValidation::validate_answer_action_data(
                                $questionAnswerData->actions,
                                $submission->QuestionnaireData,
                                $args['QuestionID']
                            );
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
                    $submission->Status = TaskSubmission::STATUS_IN_PROGRESS;

                    $submission->write();

                    return $submission;
                }
            })
            ->end();
    }

    /**
     * change task submission status to in-progress and re-load the data from JIRA\
     *
     * @param SchemaScaffolder $scaffolder The scaffolder of the schema
     * @return void
     */
    public function provideGraphQLScaffoldingtoReSyncWithJira(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('reSyncWithJira', TaskSubmission::class)
            ->addArgs([
                'UUID' => 'String!'
            ])
            ->setResolver(new class implements ResolverInterface {
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
                    $submission = TaskSubmission::get_task_submission_by_uuid($uuid);
                    $canEdit = TaskSubmission::can_edit_task_submission(
                        $submission,
                        $member,
                        ''
                    );
                    if (!$canEdit) {
                        throw new GraphQLAuthFailure();
                    }

                    $submission->Status = TaskSubmission::STATUS_IN_PROGRESS;
                    $submission->write();

                    if ($submission->TaskType === 'control validation audit') {
                        $siblingComponentSelectionTask = $submission->getSiblingTaskSubmissionsByType('selection');

                        if (empty($data->CVATaskData)) {
                            $submission->CVATaskData = $submission->getDataforCVATask($siblingComponentSelectionTask);
                        }
                    }
                    return $submission;
                }
            })
            ->end();
    }

    /**
     * @param SchemaScaffolder $scaffolder The scaffolder of the schema
     * @return void
     */
    private function provideGraphQLScaffoldingForUpdateControlValidationAuditTaskSubmission(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('updateControlValidationAuditTaskSubmission', TaskSubmission::class)
            ->addArgs([
                'UUID' => 'String!',
                'CVATaskData' => 'String'
            ])
            ->setResolver(new class implements ResolverInterface {
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
                    $submission = TaskSubmission::get_task_submission_by_uuid($uuid);
                    $canEdit = TaskSubmission::can_edit_task_submission(
                        $submission,
                        $member,
                        ''
                    );
                    if (!$canEdit) {
                        throw new GraphQLAuthFailure();
                    }
                    $submission->CompletedAt = date('Y-m-d H:i:s');
                    $submission->CVATaskData = base64_decode($args['CVATaskData']);

                    // set Submitter IP Address
                    if ($_SERVER['REMOTE_ADDR']) {
                        $submission->SubmitterIPAddress = Convert::raw2sql($_SERVER['REMOTE_ADDR']);
                    }

                    $submission->Status = TaskSubmission::STATUS_COMPLETE;

                    // if task approval requires then set status to waiting for approval
                    if ($submission->IsTaskApprovalRequired) {
                        $submission->setStatusToWatingforApproval();
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
    private function provideGraphQLScaffoldingForCompleteTaskSubmission(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('completeTaskSubmission', TaskSubmission::class)
            ->addArgs([
                'UUID' => 'String!',
                'Result' => 'String',
                'SecureToken' => 'String'
            ])
            ->setResolver(new class implements ResolverInterface {
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
                    $submission->RiskResultData = $submission->getRiskResultBasedOnAnswer();

                    // if task approval requires then set status to waiting for approval
                    if ($submission->IsTaskApprovalRequired) {
                        $submission->setStatusToWatingforApproval();
                    }

                    if ($_SERVER['REMOTE_ADDR']) {
                        $submission->SubmitterIPAddress = Convert::raw2sql($_SERVER['REMOTE_ADDR']);
                    }
                    $submission->CompletedAt = date('Y-m-d H:i:s');

                    // TODO: validate based on answer
                    if (isset($args['Result'])) {
                        $submission->Result = trim($args['Result']);
                    }

                    // create another tasks form task submission based on task submission's answer
                    Question::create_task_submissions_according_to_answers(
                        $submission->QuestionnaireData,
                        $submission->AnswerData,
                        $submission->QuestionnaireSubmissionID,
                        '',
                        $secureToken,
                        'ts'
                    );

                    $submission->write();

                    return $submission;
                }
            })
            ->end();
    }

    /**
     * set task submission status to waitig for approval
     * and send emai lto the approver
     * @return void
     */
    public function setStatusToWatingforApproval() : void
    {
        $this->Status = TaskSubmission::STATUS_WAITING_FOR_APPROVAL;

        if (!$this->IsTaskApprovalLinkSent) {
            $members = $this->approvalGroupMembers();
            $this->IsTaskApprovalLinkSent = 1;

            // send approval link email to the approver group
            if ($members->exists()) {
                $qs = QueuedJobService::create();

                $qs->queueJob(
                    new SendTaskApprovalLinkEmailJob($this, $members),
                    date('Y-m-d H:i:s', time() + 30)
                );
            }
        }
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
            ->setResolver(new class implements ResolverInterface {
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

                    // if task type is component selection, then delete
                    // it's sibling CSV task data
                    if ($submission->TaskType === 'selection' &&
                        $siblingCVATask = $submission->getSiblingTaskSubmissionsByType("control validation audit")) {
                        $siblingCVATask->CVATaskData = '';
                        $siblingCVATask->Status = TaskSubmission::STATUS_START;
                        $siblingCVATask->write();
                    }
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
            ->addArg('UUID', 'String')
            ->addArg('UserID', 'String')
            ->addArg('SecureToken', 'String')
            ->addArg('PageType', 'String')
            ->setUsePagination(false)
            ->setResolver(new class implements ResolverInterface {

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
                    $uuid = isset($args['UUID']) ? Convert::raw2sql(trim($args['UUID'])) : null;
                    $userID = isset($args['UserID']) ? (int) $args['UserID'] : null;
                    $secureToken = isset($args['SecureToken']) ? Convert::raw2sql(trim($args['SecureToken'])) : null;
                    $pageType= isset($args['PageType']) ? Convert::raw2sql(trim($args['PageType'])) : '';

                    // Check argument
                    if (!$uuid && !$userID) {
                        throw new Exception('Sorry, there is no UUID or user Id.');
                    }

                    if (!empty($userID) && $member->ID != $userID) {
                        throw new Exception('Sorry, wrong user Id.');
                    }

                    $data = [];

                    if ($uuid) {
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

                        $data->ProductAspects = $data->QuestionnaireSubmissionID ?
                            $data->QuestionnaireSubmission()->getProductAspects(): '{}';

                        if ($data->TaskType === 'security risk assessment') {
                            $data->SecurityRiskAssessmentData = $data->calculateSecurityRiskAssessmentData();
                        }

                        if ($data->TaskType === 'control validation audit') {
                            $siblingComponentSelectionTask = $data->getSiblingTaskSubmissionsByType('selection');

                            if ($siblingComponentSelectionTask) {
                                $data->setCVATaskDataSource($siblingComponentSelectionTask->ComponentTarget);
                            } else {
                                $data->setCVATaskDataSource();
                            }

                            if (empty($data->CVATaskData)) {
                                $data->CVATaskData = $data->getDataforCVATask($siblingComponentSelectionTask);
                            }
                        }
                    }

                    if ($userID && $pageType=="awaiting_approval_list") {
                        $groupIds = $member->groups()->column('ID');

                        $data = TaskSubmission::get()
                            ->filter(['ApprovalGroupID' => $groupIds])
                            ->filter('Status', TaskSubmission::STATUS_WAITING_FOR_APPROVAL)
                            ->exclude('Status', TaskSubmission::STATUS_INVALID);
                    }

                    return $data;
                }
            })
            ->end();
    }

    /**
     * Change task submission status to approve
     *
     * @param SchemaScaffolder $scaffolder SchemaScaffolder
     *
     * @return void
     */
    public function provideGraphQLScaffoldingForUpdateTaskSubmissionStatusToApproved(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('updateTaskStatusToApproved', TaskSubmission::class)
            ->addArg('UUID', 'String!')
            ->setResolver(new class implements ResolverInterface {
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

                    $member = Security::getCurrentUser();
                    $uuid = Convert::raw2sql($args['UUID']);

                    if (empty($args['UUID'])) {
                        throw new Exception('Please enter a valid argument data.');
                    }

                    $submission = TaskSubmission::get_task_submission_by_uuid($uuid);

                    if (!$submission) {
                        throw new Exception('No data available for Task Submission.');
                    }
                    //throw new Exception(TaskSubmission::STATUS_WAITING_FOR_APPROVAL);

                    if ($submission->Status != TaskSubmission::STATUS_WAITING_FOR_APPROVAL) {
                        throw new Exception('Task Submission is not ready for approval.');
                    }

                    $submission->Status = TaskSubmission::STATUS_APPROVED;
                    $submission->TaskApproverID = $member->ID;
                    $submission->write();

                    return $submission;
                }
            })
            ->end();
    }

    /**
     * Change task submission status to Deny
     *
     * @param SchemaScaffolder $scaffolder SchemaScaffolder
     *
     * @return void
     */
    public function provideGraphQLScaffoldingForUpdateTaskSubmissionStatusToDenied(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('updateTaskStatusToDenied', TaskSubmission::class)
            ->addArg('UUID', 'String!')
            ->setResolver(new class implements ResolverInterface {
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

                    $member = Security::getCurrentUser();
                    $uuid = Convert::raw2sql($args['UUID']);

                    if (empty($args['UUID'])) {
                        throw new Exception('Please enter a valid argument data.');
                    }

                    $submission = TaskSubmission::get_task_submission_by_uuid($uuid);

                    if (!$submission) {
                        throw new Exception('No data available for Task Submission.');
                    }

                    if ($submission->Status != TaskSubmission::STATUS_WAITING_FOR_APPROVAL) {
                        throw new Exception('Task Submission is not ready for approval.');
                    }

                    $submission->Status = TaskSubmission::STATUS_DENIED;
                    $submission->TaskApproverID = $member->ID;
                    $submission->write();

                    return $submission;
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
        if ($member !== null) {
            // All log in user can view it
            return true;
        }

        // Correct SecureToken can view it
        if ($taskSubmission->SecureToken && @hash_equals($taskSubmission->SecureToken, $secureToken)) {
            return true;
        }

        // Correct ApprovalLinkToken can view it
        $qs = $taskSubmission->QuestionnaireSubmission();
        if ($qs->exists() &&
            $qs->ApprovalLinkToken &&
            @hash_equals($qs->ApprovalLinkToken, $secureToken)) {
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
                if ($taskSubmission->Status === TaskSubmission::STATUS_IN_PROGRESS ||
                    $taskSubmission->Status === TaskSubmission::STATUS_START ||
                    $taskSubmission->Status === TaskSubmission::STATUS_DENIED) {
                    return true;
                }
                if ($taskSubmission->Status === TaskSubmission::STATUS_COMPLETE ||
                    $taskSubmission->Status === TaskSubmission::STATUS_WAITING_FOR_APPROVAL) {
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
            if ($taskSubmission->Status === TaskSubmission::STATUS_IN_PROGRESS ||
                $taskSubmission->Status === TaskSubmission::STATUS_START) {
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

        $this->audit();
    }

    /**
     * Encapsulates all model-specific auditing processes.
     *
     * @return void
     */
    protected function audit() : void
    {
        $user = Security::getCurrentUser();

        if (!$user) {
            $user = $this->Submitter();
        }

        $userData = '';

        if ($user) {
            $groups = $user->Groups()->column('Title');
            $userData = implode('. ', [
                'Email: ' . $user->Email,
                'Group(s): ' . ($groups ? implode(' : ', $groups) : 'N/A'),
            ]);
        }

        // audit log: for a task submission
        $doAudit = !$this->exists() && $user;
        if ($doAudit) {
            $msg = sprintf('"%s" was submitted. (UUID: %s)', $this->Task()->Name, $this->UUID);
            $this->auditService->commit('Submit', $msg, $this, $userData);
        }

        // audit log: when task status changed back to in_progress
        $doAudit = $this->exists() && $user;
        $changed = $this->getChangedFields(['Status'], 1);

        if ($doAudit && isset($changed['Status']) &&
            $changed['Status']['before'] !== 'in_progress' &&
            $changed['Status']['after'] == 'in_progress') {
            $msg = sprintf(
                '"%s" had its status changed from "%s" to "%s". (UUID: %s)',
                $this->Task()->Name,
                $changed['Status']['before'],
                $changed['Status']['after'],
                $this->UUID
            );
            $this->auditService->commit('Change', $msg, $this, $userData);
        }

        // audit log: for task submission approval by approval group member
        $hasAccess = $user || $user->Groups()->filter('Code', $this->ApprovalGroup()->Code)->exists();
        $doAudit = $this->exists() && $hasAccess;

        if ($doAudit && isset($changed['Status']) &&
            in_array($changed['Status']['after'], ['approved', 'denied', 'complete'])) {
            $msg = sprintf(
                '"%s" was %s. (UUID: %s)',
                $this->Task()->Name,
                $changed['Status']['after'] !== 'complete' ? $changed['Status']['after']:  'completed',
                $this->UUID
            );

            if ($changed['Status']['after'] == 'complete') {
                $status = $changed['Status']['after'] = 'Complete';
            } else {
                $status = ($changed['Status']['after'] === 'approved') ? 'Approve' : 'Deny';
            }

            $this->auditService->commit($status, $msg, $this, $userData);
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
        if ($this->TaskType == 'control validation audit') {
            return "#/control-validation-audit/submission/{$this->UUID}";
        }
        if ($this->TaskType == 'security risk assessment') {
            return "#/security-risk-assessment/submission/{$this->UUID}";
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

        $hostname = $this->getHostname();
        return $hostname . $secureLink;
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

            $hostname = $this->getHostname();
            return $hostname . $anonLink;
        }
    }

    /**
     * This is used by f/e logic for task submissions of _both_ ticket ("JIRA Cloud")
     * and "Local" types. It will create local records for selected components.
     *
     * @param  SchemaScaffolder $scaffolder scaffolder
     * @return void
     */
    private function provideGraphQLScaffoldingForUpdateTaskSubmissionWithSelectedComponents(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('updateTaskSubmissionWithSelectedComponents', TaskSubmission::class)
            ->addArgs([
                'UUID' => 'String!',
                'Components' => 'String!',
                'JiraKey' => 'String?' // "Local" targets will pass an empty string in the f/e
            ])
            ->setResolver(new class implements ResolverInterface {
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
                        throw new Exception('Task submission with the given UUID cannot be found');
                    }

                    // Component Selection Tasks with a "Local" ComponentTarget
                    // do not "go to JIRA"...
                    $ticketId = Convert::raw2sql($args['JiraKey'] ?? '');

                    $isRemoteTarget = $submission->Task()->isRemoteTarget();

                    // check if taget is remote
                    if ($isRemoteTarget) {
                        // check for the empty ticket
                        if (empty($ticketId)) {
                            throw new Exception('Please enter a Project Key.');
                        }

                        // Do not permit the modification of a submission with the creation
                        // of a new ticket, if a different project key is passed-in.
                        if ($submission->JiraKey && $submission->JiraKey !== $ticketId) {
                            throw new Exception(sprintf('Project key must be the same as: %s', $submission->JiraKey));
                        }
                    }

                    $selectedComponents = json_decode(base64_decode($args['Components']), true);
                    $existingComponents = $submission->SelectedComponents();

                    /** Prevent multiple ticket creation */
                    $newTicketComponents = TaskSubmission::get_component_diff(
                        $selectedComponents,
                        $existingComponents->toNestedArray(),
                        'add'
                    );

                    $removedComponentdetails = TaskSubmission::get_component_diff(
                        $existingComponents->toNestedArray(),
                        $selectedComponents,
                        'remove'
                    );

                    // remove the component
                    foreach ($removedComponentdetails as $removedComponent) {
                        $filterArray = [
                            'SecurityComponentID' => $removedComponent['SecurityComponentID']
                        ];

                        if (!empty($removedComponent['ProductAspect'])) {
                            $filterArray = [
                                'SecurityComponentID' => $removedComponent['SecurityComponentID'],
                                'ProductAspect' => $removedComponent['ProductAspect']
                            ];
                        }

                        $existingComponent = $existingComponents->filter($filterArray)->first();

                        if ($existingComponent) {
                            $existingComponent->delete();
                        }
                    }

                    $createJiraTicket = !empty($ticketId) && $isRemoteTarget;

                    // add the component
                    foreach ($newTicketComponents as $newTicketComponent) {
                        $securityComponent = SecurityComponent::get_by_id(
                            Convert::raw2sql($newTicketComponent['SecurityComponentID'])
                        );

                        if ($securityComponent) {
                            $jiraLink = '';
                            if ($createJiraTicket) {
                                $jiraLink = $submission->issueTrackerService->addTask(// <-- Makes an API call
                                    $ticketId,
                                    $securityComponent,
                                    'Task',
                                    $newTicketComponent['ProductAspect']
                                );
                            }

                            $newComp = SelectedComponent::create();
                            $newComp->ProductAspect = $newTicketComponent['ProductAspect'];
                            $newComp->SecurityComponentID = $newTicketComponent['SecurityComponentID'];
                            $newComp->TaskSubmissionID = $submission->ID;
                            $newComp->write();

                            // crete ticket
                            if ($createJiraTicket) {
                                // create a new ticket for the selected component
                                $jiraTicket = JiraTicket::create();
                                $jiraTicket->JiraKey = $ticketId;
                                $jiraTicket->TicketLink = $jiraLink;
                                $jiraTicket->SecurityComponentID = $newComp->SecurityComponentID;
                                $jiraTicket->TaskSubmissionID = $newComp->TaskSubmissionID;
                                $jiraTicket->TaskSubmissionSelectedComponentID = $newComp->ID;
                                $jiraTicket->write();
                            }
                        }
                    }

                    // save JIRA project key for the task submission
                    if ($createJiraTicket && !empty($newTicketComponents)) {
                        $submission->JiraKey = $ticketId;
                        $submission->write();
                    }

                    return $submission;
                }
            })
            ->end();
    }

    /**
     * get component different for remove and add component
     *
     * @param array  $primaryArray   array 1
     * @param array  $secondaryArray array 2
     * @param string $type           add/remove
     * @return array
     */
    public static function get_component_diff(array $primaryArray, array $secondaryArray, string $type) : array
    {
        $returnArray = [];

        if (empty($primaryArray)) {
            return $returnArray;
        }

        foreach ($primaryArray as $primaryComponent) {
            $doesComponentExist = array_filter(
                $secondaryArray,
                function ($secondaryComponent) use ($primaryComponent, $type) {
                    $primaryProductAspect = isset($primaryComponent['ProductAspect']) ?
                        $primaryComponent['ProductAspect']: '';
                    $secondaryProductAspect = isset($secondaryComponent['ProductAspect']) ?
                        $secondaryComponent['ProductAspect']: '';

                    if (empty($primaryProductAspect) && empty($secondaryProductAspect)) {
                        return (
                            (int)$secondaryComponent['SecurityComponentID']
                            ===
                            (int)$primaryComponent['SecurityComponentID']
                        );
                    }

                    if (!empty($primaryProductAspect) && $type === 'add' && empty($secondaryProductAspect)) {
                        return [];
                    }

                    if (empty($primaryProductAspect) && $type === 'remove' && !empty($secondaryProductAspect)) {
                        return [];
                    }

                    if (!empty($primaryProductAspect) && !empty($secondaryProductAspect)) {
                        return (
                            (
                                (int)$secondaryComponent['SecurityComponentID']
                                ===
                                (int)$primaryComponent['SecurityComponentID']
                            ) &&
                            (string)$secondaryProductAspect === (string)$primaryProductAspect
                        );
                    }
                }
            );

            if (empty($doesComponentExist)) {
                $returnArray[] = [
                    'SecurityComponentID' => $primaryComponent['SecurityComponentID'],
                    'ProductAspect' => isset($primaryComponent['ProductAspect'])
                        ? $primaryComponent['ProductAspect'] : '' ,
                ];
            }
        }

        return $returnArray;
    }

    /**
     * Event handler called after writing to the database.
     *
     * @return void
     */
    public function onAfterWrite()
    {
        parent::onAfterWrite();

        $changed = $this->getChangedFields(['Status'], 1);

        // if task submission status is chnaged from backend (admin panel)
        // then updathe the QuestionnaireStatus to 'submitted'
        if (array_key_exists('Status', $changed) &&
            in_array($changed['Status']['before'], ['complete', 'approved']) &&
            $changed['Status']['after'] == 'in_progress') {
            $this->QuestionnaireSubmission()->QuestionnaireStatus = 'submitted';
            $this->QuestionnaireSubmission()->write();
        }
    }

    /**
     * Check if task approver is required
     * first check this on task level and then on action answer level
     *
     * @return boolean
     */
    public function getIsTaskApprovalRequired()
    {
        if (!$this->ApprovalGroup()->exists()) {
            return false;
        }

        if ($this->IsApprovalRequired) {
            return true;
        }

        if ($this->QuestionnaireData && $this->AnswerData) {
            $questionnaireDataObj = json_decode($this->QuestionnaireData);
            $answerDataObj = json_decode($this->AnswerData);

            $actionIdsforApproval = [];

            foreach ($questionnaireDataObj as $obj) {
                if ($obj->AnswerFieldType == 'action') {
                    foreach ($obj->AnswerActionFields as $answerActionField) {
                        //skip if this AAF is falsey for any reason
                        if (!$answerActionField) {
                            continue;
                        }

                        $approvalForTaskRequired = false;
                        if (isset($answerActionField->IsApprovalForTaskRequired)) {
                            $approvalForTaskRequired = (bool) $answerActionField->IsApprovalForTaskRequired;
                        }

                        if ($approvalForTaskRequired) {
                              $actionIdsforApproval[] = $answerActionField->ID;
                        }
                    }
                }
            }

            if (empty($actionIdsforApproval)) {
                return false;
            }

            foreach ($answerDataObj as $obj) {
                if ($obj->answerType) {
                    foreach ($obj->actions as $action) {
                        if ($action->isChose && in_array($action->id, $actionIdsforApproval)) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    /**
     * Check if current user has access to approve and denied
     *
     * @return boolean
     */
    public function getIsCurrentUserAnApprover()
    {
        $member = Security::getCurrentUser();

        if (!$member) {
            return false;
        }

        if (!$member->groups()->exists()) {
            return false;
        }

        $groupIds = $member->groups()->column('ID');

        if (in_array($this->ApprovalGroup()->ID, $groupIds)) {
            return true;
        }

        return false;
    }

     /**
      * Not able to access members directly using relationship ($this->ApprovalGroup()->Members()),
      * getting the below error
      * (Cannot serialize Symfony\Component\Cache\Simple\Php File Cache in graphql)
      * that's why I need this function
      *
      * @throws Exception
      * @return DataList
      */
    public function approvalGroupMembers()
    {
        if (!$this->ApprovalGroup()->exists()) {
            throw new Exception('Sorry, no approval group exist.');
        }

        $group = Group::get()->filter('code', $this->ApprovalGroup()->Code)->first();

        return $group->Members();
    }

    /**
     * @param string $string     string
     * @param string $linkPrefix prefix before the link
     * @return string
     */
    public function replaceVariable($string = '', $linkPrefix = '')
    {
        $taskName = $this->Task()->Name;
        $SubmitterName = $this->Submitter()->Name;
        $SubmitterEmail = $this->Submitter()->Email;

        if ($linkPrefix) {
            $link = $this->AnonymousAccessLink($linkPrefix);
        } else {
            $link = $this->SecureLink();
        }

        $string = str_replace('{$taskName}', $taskName, $string);
        $string = str_replace('{$taskLink}', $link, $string);
        $string = str_replace('{$submitterName}', $SubmitterName, $string);
        $string = str_replace('{$submitterEmail}', $SubmitterEmail, $string);

        return $string;
    }

    /**
     * @return string
     */
    public function getRiskResultBasedOnAnswer()
    {
        // Deal with the related Questionnaire's Task-calcs, and append them
        $allRiskResults = [];

        if (!in_array($this->Status, ["start", "in_progress", "invalid"])) {
            $allRiskResults = $this->getRiskResult('t');
        }

        return json_encode($allRiskResults);
    }

    /**
     * Get all sibling task submissions from the parent
     * This list will include the current task submission
     *
     * @return DataList | null
     */
    public function getSiblingTaskSubmissions()
    {
        $qs = $this->QuestionnaireSubmission();
        if ($qs && $qs->exists()) {
            return $qs->TaskSubmissions();
        }

        return null;
    }

    /**
     * Get sibling task submissions by type from the parent
     * This list will include the current task submission
     *
     * @param string $type task type
     *
     * @return DataList | null
     */
    public function getSiblingTaskSubmissionsByType($type)
    {
        $siblingTasks = $this->getSiblingTaskSubmissions();

        if ($siblingTasks && $siblingTasks->Count() && ($taskByType = $siblingTasks->find('Task.TaskType', $type))) {
            return $taskByType;
        }

        return null;
    }

    /**
     * Get sibling task submissions status by type
     *
     * @param Dataonject $siblingTask sibling task
     * @return bool
     */
    public function isSiblingTaskCompleted($siblingTask) : bool
    {
        if ($siblingTask) {
            return ($siblingTask->Status === self::STATUS_COMPLETE ||
            $siblingTask->Status === self::STATUS_APPROVED);
        }

        return false;
    }

    /**
     * Find a risk assessment questionnaire task amongst the siblings of this
     * task submission, and return its risk result data.
     *
     * For reasons that escape the developer, GraphQL will not return this
     * TaskSubmission object as an object. It's cast to a string instead.
     * It will not return anything at all unless this specific name is used.
     * Thus, we use this getter to get the submission, and return an actual
     * string of data that we need (the RiskResultData, in this case)
     *
     * If you think you could use an alternative getter method here, like
     * getRiskResultDataFromTaskSubmission and call this getter, that doesn't
     * work either.
     *
     * @return string it's always a string, even if you want an object. it might
     *                also be null, if there aren't any other siblings
     */
    public function getRiskAssessmentTaskSubmission()
    {
        $siblings = $this->getSiblingTaskSubmissions();
        if ($siblings && $siblings->Count()) {
            $task = $siblings->find('Task.TaskType', 'risk questionnaire');

            //we should actually return a task here, but GraphQL has other ideas
            //returning the object will cast it to a string, so grab something
            //useful and return that instead.
            return $task->RiskResultData;
        }

        return null;
    }

    /**
     * @param DataObject $siblingTask sibling component selection task
     *
     * @return string
     */
    public function getDataforCVATask($siblingTask) : string
    {
        $selectedComponent = [];

        // if there is no sibling component selection task, then return default component od CVA task
        if (empty($siblingTask)) {
            return json_encode($this->getDefaultComponentsFromCVATask());
        }

        $isSiblingTaskCompleted = $this->isSiblingTaskCompleted($siblingTask);

        // if sibling component selection task exist and component target is "Local"
        if ($isSiblingTaskCompleted && $siblingTask->ComponentTarget == "Local") {
            $selectedComponent = $this->getSelectedComponentForLocal($siblingTask);
        }

        if ($isSiblingTaskCompleted && $siblingTask->ComponentTarget == "JIRA Cloud") {
            $selectedComponent = $this->getSelectedComponentForJiraCloud($siblingTask);
        }

        return json_encode($selectedComponent);
    }

    /**
     * get the selected component from the "component selection" task
     * when target type is "Local".
     *
     * @param DataObject $componentSelectionTask component selection task
     *
     * @return array
     */
    public function getSelectedComponentForLocal($componentSelectionTask) : array
    {
        $out = [];

        if (!$componentSelectionTask) {
            return $out;
        }

        $selectedComponents = $componentSelectionTask->SelectedComponents();

        if (!$selectedComponents) {
            return $out;
        }

        foreach ($selectedComponents as $comp) {
            $controls = [];

            if (!$comp->SecurityComponentID) {
                continue;
            }

            foreach ($comp->SecurityComponent()->Controls() as $ctrl) {
                $controls[] = [
                    'id' => $ctrl->ID,
                    'name' => $ctrl->Name,
                    'description' => $ctrl->Description,
                    'implementationGuidance' => $ctrl->ImplementationGuidance,
                    'selectedOption' => SecurityControl::CTL_STATUS_2
                ];
            }

            $out[] = [
                'id' => $comp->SecurityComponent()->ID,
                'name' => $comp->SecurityComponent()->Name,
                'productAspect' => $comp->ProductAspect,
                'controls' => $controls
            ];
        }

        return $out;
    }

    /**
     * get the selected component from the "component selection" task
     * when target type is "JIRA Cloud"
     *
     * @param DataObject $componentSelectionTask component selection task
     *
     * @return array
     */
    public function getSelectedComponentForJiraCloud($componentSelectionTask) : array
    {
        $out = [];

        if (!$componentSelectionTask) {
            return $out;
        }

        $selectedComponents = $componentSelectionTask->SelectedComponents();

        if (!$selectedComponents) {
            return $out;
        }

        foreach ($selectedComponents as $selectedComponent) {
            $securityComponent = $selectedComponent->SecurityComponent();

            if (!$securityComponent) {
                continue;
            }

            $controls = [];
            // get JiraTicket details
            $ticket = JiraTicket::get()
              ->filter([
                  'TaskSubmissionID' => $selectedComponent->TaskSubmissionID,
                  'SecurityComponentID' => $selectedComponent->SecurityComponentID,
                  'TaskSubmissionSelectedComponentID' => $selectedComponent->ID
              ])->first();

            if (($localControls = $securityComponent->Controls()) && $ticket) {
                $remoteControls =
                    $componentSelectionTask->issueTrackerService->getControlDetailsFromJiraTicket($ticket) ?: [];

                foreach ($localControls as $localControl) {
                    $doesControlExist = [];
                    $doesControlExist = array_filter($remoteControls, function ($remoteControl) use ($localControl) {
                        return (int)$remoteControl['ID'] === (int)$localControl->ID;
                    });

                    if (!empty($remoteControl = array_pop($doesControlExist))) {
                        $controls[] = [
                            'id' => $localControl->ID,
                            'name' => $localControl->Name,
                            'selectedOption' => $remoteControl['SelectedOption']
                        ];
                    }
                }
            }

            $out[] = [
                'id' => $securityComponent->ID,
                'name' => $securityComponent->Name,
                'productAspect' => $selectedComponent->ProductAspect,
                'jiraTicketLink' => $ticket ? $ticket->TicketLink : '',
                'controls' => $controls
            ];
        }

        return $out;
    }

    /**
     * When no component selection task is available, we show default components
     * from the CVA task amongst the siblings of this task submission. These
     * default components are configured on the CVA task itself
     *
     * @return array
     */
    public function getDefaultComponentsFromCVATask() : array
    {
        $out = [];

        if ($this->TaskType !== 'control validation audit') {
            return $out;
        }

        $selectedComponents = $this->Task()->DefaultSecurityComponents();

        if (!$selectedComponents) {
            return $out;
        }

        foreach ($selectedComponents as $comp) {
            $controls = [];

            foreach ($comp->Controls() as $ctrl) {
                $controls[] = [
                    'id' => $ctrl->ID,
                    'name' => $ctrl->Name,
                    'selectedOption' => SecurityControl::CTL_STATUS_2,
                    'description' => $ctrl->Description,
                    'implementationGuidance' => $ctrl->ImplementationGuidance
                ];
            }

            $out[] = [
                'id' => $comp->ID,
                'name' => $comp->Name,
                'productAspect' => $comp->ProductAspect,
                'controls' => $controls
            ];
        }

        return $out;
    }

    /**
     * Get the current hostname or an alternate one from the SiteConfig
     *
     * @return string
     */
    public function getHostname() : string
    {
        $hostname = Director::absoluteBaseURL();
        $config = SiteConfig::current_site_config();
        if ($config->AlternateHostnameForEmail) {
            $hostname = $config->AlternateHostnameForEmail;
        }

        return $hostname;
    }

    /**
     * Update CMS Fields specific to the control validation audit task
     * submission. At some point this should be moved into the getCMSFields
     * method of a separate subclass of Task
     *
     * @param [type] $fields FieldList obtained from getCMSFields
     * @return FieldList a modified version of $fields, passed in via parameter
     */
    public function getCVA_CMSFields($fields)
    {
        $fields->removeByName(
            [
                'QuestionData',
                'AnswerData',
                'QuestionnaireDataToggle',
                'AnswerDataToggle',
                'CVATaskData',
                'EmailRelativeLinkToTask',
                'JiraKey',
                'JiraTickets',
                'SelectedComponents',
                'ResultToggle',
                'Result'
            ]
        );
        $fields->addFieldToTab(
            'Root.TaskSubmissionData',
            ToggleCompositeField::create(
                'CVATaskDataToggle',
                'CVA Task Data',
                [
                    TextareaField::create('CVATaskData')
                ]
            )
        );
        return $fields;
    }
}
