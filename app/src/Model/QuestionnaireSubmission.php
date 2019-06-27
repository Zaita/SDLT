<?php

/**
 * This file contains the "QuestionnaireSubmission" class.
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
use NZTA\SDLT\Job\SendApprovedNotificationEmailJob;
use SilverStripe\GraphQL\OperationResolver;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ResolverInterface;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use SilverStripe\ORM\DataObject;
use SilverStripe\Security\Member;
use SilverStripe\Security\Security;
use SilverStripe\Security\Group;
use SilverStripe\Security\SecurityToken;
use SilverStripe\ORM\HasManyList;
use SilverStripe\Control\Email\Email;
use Symbiote\QueuedJobs\Services\QueuedJobService;
use NZTA\SDLT\Job\SendStartLinkEmailJob;
use NZTA\SDLT\Job\SendSummaryPageLinkEmailJob;
use NZTA\SDLT\Job\SendApprovalLinkEmailJob;
use NZTA\SDLT\Job\SendDeniedNotificationEmailJob;
use Silverstripe\Control\Director;
use SilverStripe\Core\Convert;
use Ramsey\Uuid\Uuid;
use NZTA\SDLT\Validation\QuestionnaireValidation;
use SilverStripe\Forms\LiteralField;

/**
 * Class Questionnaire
 *
 * @property string Name
 * @property string KeyInformation
 * @property string ApprovalLinkToken
 * @property string QuestionnaireStatus
 *
 * @method Questionnaire Questionnaire()
 * @method Member User()
 * @method HasManyList TaskSubmissions()
 */
class QuestionnaireSubmission extends DataObject implements ScaffoldingProvider
{
    /**
     * @var string
     */
    private static $table_name = 'QuestionnaireSubmission';

    /**
     * @var array
     */
    private static $db = [
        'SubmitterName' => 'Varchar(255)',
        'SubmitterEmail'=> 'Varchar(255)',
        'QuestionnaireData' => 'Text',
        'AnswerData' => 'Text',
        'QuestionnaireStatus' => 'Enum(array("in_progress", "submitted", "waiting_for_security_architect_approval","waiting_for_approval", "approved", "denied"))',
        'UUID' => 'Varchar(36)',
        'IsStartLinkEmailSent' => 'Boolean',
        'IsEmailSentToSecurityArchitect' => 'Boolean',
        'IsSubmitLinkEmailSent' => 'Boolean',
        'CisoApprovalStatus' => 'Enum(array("not_applicable", "pending", "approved", "denied"))',
        'CisoApproverIPAddress' => 'Varchar(255)',
        'CisoApproverMachineName' => 'Varchar(255)',
        'CisoApprovalStatusUpdateDate' => 'Varchar(255)',
        'BusinessOwnerApprovalStatus' => 'Enum(array("not_applicable", "pending", "approved", "denied"))',
        'BusinessOwnerMachineName' => 'Varchar(255)',
        'BusinessOwnerStatusUpdateDate' => 'Varchar(255)',
        'BusinessOwnerIPAddress' => 'Varchar(255)',
        'BusinessOwnerEmailAddress' => 'Varchar(255)',
        'SecurityArchitectApprovalStatus' => 'Enum(array("not_applicable", "pending", "approved", "denied"))',
        'SecurityArchitectApproverIPAddress' => 'Varchar(255)',
        'SecurityArchitectApproverMachineName' => 'Varchar(255)',
        'SecurityArchitectStatusUpdateDate' => 'Varchar(255)',
        'ApprovalLinkToken' => 'Varchar(64)',
        'ProductName' => 'Text'
    ];

    /**
     * @var array
     */
    private static $has_one = [
        'User' => Member::class,
        'Questionnaire' => Questionnaire::class,
        'CisoApprover' => Member::class,
        'SecurityArchitectApprover' => Member::class
    ];

    /**
     * @var array
     */
    private static $has_many = [
        'TaskSubmissions' => TaskSubmission::class
    ];

    /**
     * @var array
     */
    private static $summary_fields = [
        'getQuestionnaireName' => 'Questionnaire Name',
        'ProductName',
        'SubmitterName',
        'SubmitterEmail',
        'getPrettifyQuestionnaireStatus' => 'Questionnaire Status',
        'CisoApprovalStatus',
        'BusinessOwnerApprovalStatus',
        'SecurityArchitectApprovalStatus',
        'UUID',
        'IsStartLinkEmailSent',
        'Created' => 'Created date'
    ];

    /**
     * Default sort ordering
     *
     * @var array
     */
    private static $default_sort = ['ID' => 'DESC'];

    /**
     * CMS Fields
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        $fields->addFieldsToTab(
            'Root.Main',
            [
                LiteralField::create('SummaryPageLink', 'Summary Page Link')
                    ->setValue('Please click on
                        <a href="'. $this->getSummaryPageLink() .'">this link</a>
                        to download answers in the PDF.')
            ]
        );

        $fields->addFieldsToTab(
            'Root.QuestionnaireAnswerData',
            [
                $fields->dataFieldByName('QuestionnaireData'),
                $fields->dataFieldByName('AnswerData')
            ]
        );

        $fields->addFieldsToTab(
            'Root.SubmitterDetails',
            [
                $fields->dataFieldByName('UserID'),
                $fields->dataFieldByName('SubmitterName'),
                $fields->dataFieldByName('SubmitterEmail'),
                $fields->dataFieldByName('IsStartLinkEmailSent'),
                $fields->dataFieldByName('IsSubmitLinkEmailSent')
            ]
        );

        $fields->addFieldsToTab(
            'Root.SecurityArchitectDetails',
            [
                $fields->dataFieldByName('SecurityArchitectApproverID'),
                $fields->dataFieldByName('SecurityArchitectApprovalStatus'),
                $fields->dataFieldByName('SecurityArchitectApproverIPAddress'),
                $fields->dataFieldByName('SecurityArchitectApproverMachineName'),
                $fields->dataFieldByName('SecurityArchitectStatusUpdateDate'),
                $fields->dataFieldByName('IsEmailSentToSecurityArchitect')
            ]
        );

        $fields->addFieldsToTab(
            'Root.CisoDetails',
            [
                $fields->dataFieldByName('CisoApproverID'),
                $fields->dataFieldByName('CisoApprovalStatus'),
                $fields->dataFieldByName('CisoApproverIPAddress'),
                $fields->dataFieldByName('CisoApproverMachineName'),
                $fields->dataFieldByName('CisoApprovalStatusUpdateDate')
            ]
        );

        $fields->addFieldsToTab(
            'Root.BusinessOwnerDetails',
            [
                $fields->dataFieldByName('BusinessOwnerEmailAddress'),
                $fields->dataFieldByName('BusinessOwnerApprovalStatus'),
                $fields->dataFieldByName('BusinessOwnerIPAddress'),
                $fields->dataFieldByName('BusinessOwnerMachineName'),
                $fields->dataFieldByName('BusinessOwnerStatusUpdateDate')
            ]
        );

        return $fields;
    }

    /**
     * @return string
     */
    public function getQuestionnaireName()
    {
        return $this->Questionnaire()->Name;
    }

    /**
     * @return string
     */
    public function getPrettifyQuestionnaireStatus()
    {
        $mapping = [
            'in_progress' => 'In Progress',
            'submitted' => 'Submitted',
            'waiting_for_security_architect_approval' => 'Awaiting Security Architect Approval',
            'waiting_for_approval' => 'Awaiting Business Owner Approval',
            'approved' => 'Approved',
            'denied' => 'Denied'
        ];

        return isset($mapping[$this->QuestionnaireStatus]) ? $mapping[$this->QuestionnaireStatus] : $this->QuestionnaireStatus;
    }

    /**
     * get is current user has access for approval or not
     * and this value is only for CISO and Security-architect
     * for business owner we will use token based url
     *
     * @return boolean
     */
    public function getIsCurrentUserAnApprover()
    {
        $member = Security::getCurrentUser();

        if (!$member) {
            return false;
        }

        $accessDetail = $this->doesCurrentUserHasAccessToApproveDeny($member);

        if (!empty($accessDetail)) {
            return $accessDetail['hasAccess'];
        }

        return false;
    }

    /**
     * get is current user is business and has access to approve and deny
     *
     * @return boolean
     */
    public function getIsCurrentUserABusinessOwnerApprover()
    {
        $member = Security::getCurrentUser();

        if (!$member) {
            return false;
        }

        // check access details for business owner
        if ($this->QuestionnaireStatus == 'waiting_for_approval' &&
            $this->BusinessOwnerApprovalStatus == 'pending' &&
            $member->Email == $this->BusinessOwnerEmailAddress) {
            return true;
        }

        return false;
    }

    /**
     * @param SchemaScaffolder $scaffolder Scaffolder
     * @return SchemaScaffolder
     */
    public function provideGraphQLScaffolding(SchemaScaffolder $scaffolder)
    {
        // Provide entity type
        $submissionScaffolder = $scaffolder
            ->type(QuestionnaireSubmission::class)
            ->addFields([
                'ID',
                'UUID',
                'ApprovalLinkToken',
                'SubmitterName',
                'SubmitterEmail',
                'QuestionnaireStatus',
                'CisoApprovalStatus',
                'BusinessOwnerApprovalStatus',
                'QuestionnaireData',
                'AnswerData',
                'Questionnaire',
                'User',
                'BusinessOwnerEmailAddress',
                'CisoApprover',
                'SecurityArchitectApprover',
                'CisoApproverIPAddress',
                'CisoApproverMachineName',
                'CisoApprovalStatusUpdateDate',
                'BusinessOwnerApprovalStatus',
                'BusinessOwnerIPAddress',
                'BusinessOwnerMachineName',
                'BusinessOwnerStatusUpdateDate',
                'SecurityArchitectApprovalStatus',
                'SecurityArchitectApproverIPAddress',
                'SecurityArchitectApproverMachineName',
                'SecurityArchitectStatusUpdateDate',
                'IsCurrentUserAnApprover',
                'IsCurrentUserABusinessOwnerApprover',
                'IsEmailSentToSecurityArchitect',
                'IsSubmitLinkEmailSent',
                'ProductName',
                'QuestionnaireName',
                'Created'
            ]);

        $submissionScaffolder
            ->nestedQuery('TaskSubmissions')
            ->setUsePagination(false)
            ->setResolver(new class implements OperationResolver {
                /**
                 * Invoked by the Executor class to resolve this mutation / query
                 * @see Executor
                 *
                 * @param QuestionnaireSubmission $object  object
                 * @param array                   $args    args
                 * @param mixed                   $context context
                 * @param ResolveInfo             $info    info
                 * @return mixed
                 */
                public function resolve($object, array $args, $context, ResolveInfo $info)
                {
                    return $object->TaskSubmissions()->exclude('Status', TaskSubmission::STATUS_INVALID);
                }
            })
            ->end();

        $submissionScaffolder
            ->operation(SchemaScaffolder::READ)
            ->setName('readQuestionnaireSubmission')
            ->addArg('UUID', 'String')
            ->addArg('UserID', 'String')
            ->addArg('SecureToken', 'String')
            ->addArg('IsBusinessOwnerSummaryPage', 'String')
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
                    $uuid = isset($args['UUID']) ? htmlentities(trim($args['UUID'])) : null;
                    $userID = isset($args['UserID']) ? htmlentities(trim($args['UserID'])) : null;
                    $secureToken = isset($args['SecureToken']) ? Convert::raw2sql(trim($args['SecureToken'])) : null;
                    $isBusinessOwnerSummaryPage= isset($args['IsBusinessOwnerSummaryPage']) ? Convert::raw2sql(trim($args['IsBusinessOwnerSummaryPage'])) : '0';

                    // To continue the data fetching, user has to be logged-in or has secure token
                    if (!$member && !$secureToken) {
                        throw new GraphQLAuthFailure();
                    }

                    // Check argument
                    if (!$uuid && !$userID) {
                        throw new Exception('Sorry, wrong UUID or user Id.');
                    }

                    if (!empty($userID) && $member->ID != $userID) {
                        throw new Exception('Sorry, wrong user Id.');
                    }

                    if ($isBusinessOwnerSummaryPage && empty($secureToken)) {
                        throw new Exception('Sorry, please enter token value as well.');
                    }


                    // Filter data by UUID
                    // The questionnaire can be read by other users
                    /* @var $data QuestionnaireSubmission */
                    $data = null;
                    if ($uuid) {
                        $data = QuestionnaireSubmission::get()->filter(['UUID' => $uuid])->first();
                    }

                    if ($userID) {
                        $data = QuestionnaireSubmission::get()->filter(['UserID' => $userID]);
                    }

                    // If the user is not logged-in and the secure token is not valid, throw error
                    if (!empty($secureToken) && !hash_equals($data->ApprovalLinkToken, $secureToken)) {
                        throw new Exception('Sorry, wrong security token.');
                    }

                    return $data;
                }
            })
            ->end();

        $this->createQuestionnaireSubmission($scaffolder);
        $this->updateQuestionnaireSubmission($scaffolder);
        $this->updateQuestionnaireStatusToSubmitted($scaffolder);
        $this->updateQuestionnaireStatusToInProgress($scaffolder);
        $this->updateQuestionnaireStatusToWaitingForSecurityArchitectApproval($scaffolder);

        // Approve/Deny for Business Owner
        $this->updateQuestionnaireStatusToApproved($scaffolder);
        $this->updateQuestionnaireStatusToDenied($scaffolder);

        // Approve/Deny for Security Architect and Chief Information Security Officer
        $this->updateQuestionnaireOnApproveByGroupMember($scaffolder);
        $this->updateQuestionnaireOnDenyByGroupMember($scaffolder);

        return $scaffolder;
    }

    /**
     * createQuestionnaireSubmission - this api will call when user will click on start button.
     * This api will create a new entry in QuestionnaireSubmission table
     *
     * @param SchemaScaffolder $scaffolder SchemaScaffolder
     *
     * @return void
     */
    public function createQuestionnaireSubmission(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('createQuestionnaireSubmission', QuestionnaireSubmission::class)
            ->addArgs([
                'QuestionnaireID' => 'ID!'
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
                    QuestionnaireValidation::is_user_logged_in();

                    $member = Security::getCurrentUser();
                    // Check submission ID
                    if (empty($args['QuestionnaireID']) || !is_numeric($args['QuestionnaireID'])) {
                        throw new Exception('Please enter a valid ID.');
                    }

                    $questionnaire = Questionnaire::get()->byID($args['QuestionnaireID']);

                    // Check Questionnaire
                    if (!$questionnaire) {
                        throw new Exception('Please select a valid Questionnaire.');
                    }

                    // Check Questionnaire's questions
                    if (!$questionnaire->Questions()->count()) {
                        throw new Exception('Sorry, no question available for selected Questionnaire.');
                    }

                    $model = QuestionnaireSubmission::create();

                    $model->SubmitterName = $member->FirstName;
                    $model->SubmitterEmail = $member->Email;
                    $model->QuestionnaireStatus = 'in_progress';

                    // set approval status of BO, SA and CISO
                    $model->CisoApprovalStatus = 'pending';

                    $model->BusinessOwnerApprovalStatus = 'pending';

                    $model->SecurityArchitectApprovalStatus = 'pending';

                    $model->QuestionnaireID = $questionnaire->ID;

                    $model->UserID = $member->ID;
                    $model->IsStartLinkEmailSent = 0;
                    $model->IsEmailSentToSecurityArchitect = 0;
                    $uuid = Uuid::uuid4();
                    $model->UUID = (string) $uuid;

                    $model->ApprovalLinkToken = hash('sha3-256', random_bytes(64));

                    $model->QuestionnaireData = $model->getQuestionsData($questionnaire);

                    $model->write();

                    return $model;
                }
            })
            ->end();
    }

    /**
     * updateQuestionnaireSubmission - this api will call when user will enter/update
     * their answer
     *
     * @param SchemaScaffolder $scaffolder SchemaScaffolder
     *
     * @return void
     */
    public function updateQuestionnaireSubmission(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('updateQuestionnaireSubmission', QuestionnaireSubmission::class)
            ->addArgs([
                'ID' => 'ID!',
                'QuestionID' => 'ID!',
                'AnswerData' => 'String'
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

                    QuestionnaireValidation::is_user_logged_in();

                    $questionnaireSubmission = QuestionnaireSubmission::validate_before_updating_questionnaire_submission($args['ID']);

                    $questionnaireSubmission->doesQuestionnairBelongToCurrentUser();

                    // Check args: question ID
                    if (empty($args['QuestionID']) || !is_numeric($args['QuestionID'])) {
                        throw new Exception('Please enter a valid QuestionID.');
                    }

                    // Check args: answer data
                    if (empty($args['AnswerData']) || !is_string($args['AnswerData'])) {
                        throw new Exception('Please enter a valid AnswerData.');
                    }

                    // AnswerData is generated by `window.btoa(JSON.stringify(answerData))` in JavaScript
                    // This is to avoid parsing issue caused by `quote`, `\n` and other special characters
                    $jsonDecodeAnswerData = json_decode(base64_decode($args['AnswerData']));

                    if (is_null($jsonDecodeAnswerData)) {
                        throw new Exception('data is not a vaild json object.');
                    }

                    // Validate answer data
                    do {
                        // If there is no answer or not applicable, don't validate it
                        // Scenario: only use this API to save "current" and "applicable" flag
                        if ((bool)($jsonDecodeAnswerData->hasAnswer) === false) {
                            break;
                        }
                        if ((bool)($jsonDecodeAnswerData->isApplicable) === false) {
                            break;
                        }

                        if ($jsonDecodeAnswerData->answerType == "input") {
                            // validate input field data
                            QuestionnaireValidation::validate_answer_input_data($jsonDecodeAnswerData->inputs, $questionnaireSubmission->QuestionnaireData, $args['QuestionID']);
                        }

                        if ($jsonDecodeAnswerData->answerType == "action") {
                            //validate action field
                            QuestionnaireValidation::validate_answer_action_data($jsonDecodeAnswerData->actions, $questionnaireSubmission->QuestionnaireData, $args['QuestionID']);
                        }
                    } while (false);

                    if ($jsonDecodeAnswerData->answerType == "input") {
                        // check if input field is business owner email field
                        $businessOwnerEmail = QuestionnaireSubmission::is_business_owner_email_field(
                            isset($jsonDecodeAnswerData->inputs) ? $jsonDecodeAnswerData->inputs : [],
                            $questionnaireSubmission->QuestionnaireData,
                            $args['QuestionID']
                        );

                        // if it is business owner email field, then add product owner email address
                        if (!is_bool($businessOwnerEmail)) {
                            $questionnaireSubmission->BusinessOwnerEmailAddress = $businessOwnerEmail;
                        }

                        $isProductName = QuestionnaireSubmission::is_product_name_field(
                            isset($jsonDecodeAnswerData->inputs) ? $jsonDecodeAnswerData->inputs : [],
                            $questionnaireSubmission->QuestionnaireData,
                            $args['QuestionID']
                        );

                        // if it is product name text field, then add product name
                        if (is_string($isProductName)) {
                            $questionnaireSubmission->ProductName = $isProductName;
                        }
                    }

                    $answerDataArr = [];

                    if (!empty($questionnaireSubmission->AnswerData)) {
                        $answerDataArr = json_decode($questionnaireSubmission->AnswerData, true);
                    }

                    $answerDataArr[$args['QuestionID']] = $jsonDecodeAnswerData;

                    $data = json_encode($answerDataArr);

                    $questionnaireSubmission->AnswerData = $data;

                    $questionnaireSubmission->write();

                    return $questionnaireSubmission;
                }
            })
            ->end();
    }

    /**
     * updateQuestionnaireStatusToSubmitted - this api will call when user click
     * on submit button, after completing the anwers user can update the answers
     *
     * @param SchemaScaffolder $scaffolder SchemaScaffolder
     *
     * @return void
     */
    public function updateQuestionnaireStatusToSubmitted(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('updateQuestionnaireStatusToSubmitted', QuestionnaireSubmission::class)
            ->addArgs([
                'ID' => 'ID!',
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
                    QuestionnaireValidation::is_user_logged_in();

                    $questionnaireSubmission = QuestionnaireSubmission::validate_before_updating_questionnaire_submission($args['ID']);

                    $questionnaireSubmission->doesQuestionnairBelongToCurrentUser();

                    $questionnaireSubmission->QuestionnaireStatus = 'submitted';

                    $questionnaireSubmission->write();

                    // after submit the questionnaire, please send a summary page link
                    // to the submitter
                    $queuedJobService = QueuedJobService::create();

                    if (!$questionnaireSubmission->IsSubmitLinkEmailSent) {
                        $questionnaireSubmission->IsSubmitLinkEmailSent = 1;

                        $queuedJobService->queueJob(
                            new SendSummaryPageLinkEmailJob($questionnaireSubmission),
                            date('Y-m-d H:i:s', time() + 30)
                        );
                    }

                    $questionnaireSubmission->write();

                    return $questionnaireSubmission;
                }
            })
            ->end();
    }

    /**
     * updateQuestionnaireStatusToInProgress - this api will call when user will
     * click on edit answers button
     *
     * @param SchemaScaffolder $scaffolder SchemaScaffolder
     *
     * @return void
     */
    public function updateQuestionnaireStatusToInProgress(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('updateQuestionnaireStatusToInProgress', QuestionnaireSubmission::class)
            ->addArgs([
                'ID' => 'ID!',
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
                    QuestionnaireValidation::is_user_logged_in();

                    $questionnaireSubmission = QuestionnaireSubmission::validate_before_updating_questionnaire_submission($args['ID']);

                    $questionnaireSubmission->doesQuestionnairBelongToCurrentUser();

                    $questionnaireSubmission->QuestionnaireStatus = 'in_progress';

                    $questionnaireSubmission->write();

                    // Mark all related task submissions as "invalid"
                    $questionnaireSubmission->TaskSubmissions()->each(function (TaskSubmission $taskSubmission) {
                        $taskSubmission->Status = TaskSubmission::STATUS_INVALID;
                        $taskSubmission->write();
                    });

                    return $questionnaireSubmission;
                }
            })
            ->end();
    }

    /**
     * @param SchemaScaffolder $scaffolder SchemaScaffolder
     *
     * @return void
     */
    public function updateQuestionnaireStatusToWaitingForSecurityArchitectApproval(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('updateQuestionnaireStatusToWaitingForSecurityArchitectApproval', QuestionnaireSubmission::class)
            ->addArgs([
                'ID' => 'ID!',
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
                    QuestionnaireValidation::is_user_logged_in();

                    $questionnaireSubmission = QuestionnaireSubmission::validate_before_updating_questionnaire_submission($args['ID']);

                    $questionnaireSubmission->doesQuestionnairBelongToCurrentUser();

                    $questionnaireSubmission->QuestionnaireStatus = 'waiting_for_security_architect_approval';

                    if (!$questionnaireSubmission->IsEmailSentToSecurityArchitect) {
                        $members = $questionnaireSubmission->getApprovalMembersListByGroup(UserGroupConstant::GROUP_CODE_SA);

                        if (!$members) {
                            throw new Exception('Please add member in Security architect group.');
                        }

                        $questionnaireSubmission->IsEmailSentToSecurityArchitect = 1;

                        // Send Email to Security Architect group for Approval
                        $qs = QueuedJobService::create();

                        $qs->queueJob(
                            new SendApprovalLinkEmailJob($questionnaireSubmission, $members),
                            date('Y-m-d H:i:s', time() + 90)
                        );
                    }

                    $questionnaireSubmission->write();

                    return $questionnaireSubmission;
                }
            })
            ->end();
    }

    /**
     * this api will call if group member (Security architect and CISO) will click
     * on approve button
     *
     * @param SchemaScaffolder $scaffolder SchemaScaffolder
     *
     * @return void
     */
    public function updateQuestionnaireOnApproveByGroupMember(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('updateQuestionnaireOnApproveByGroupMember', QuestionnaireSubmission::class)
            ->addArgs([
                'ID' => 'ID!',
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
                    QuestionnaireValidation::is_user_logged_in();

                    $questionnaireSubmission = QuestionnaireSubmission::validate_before_updating_questionnaire_submission($args['ID']);

                    $questionnaireSubmission->updateQuestionnaireOnApproveAndDenyByGroup('approved');

                    return $questionnaireSubmission;
                }
            })
            ->end();
    }

    /**
     * this api will call if group member (Security architect and CISO) will click
     * on Deny button
     *
     * @param SchemaScaffolder $scaffolder SchemaScaffolder
     *
     * @return void
     */
    public function updateQuestionnaireOnDenyByGroupMember(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('updateQuestionnaireOnDenyByGroupMember', QuestionnaireSubmission::class)
            ->addArgs([
                'ID' => 'ID!',
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
                    QuestionnaireValidation::is_user_logged_in();

                    $questionnaireSubmission = QuestionnaireSubmission::validate_before_updating_questionnaire_submission($args['ID']);

                    $questionnaireSubmission->updateQuestionnaireOnApproveAndDenyByGroup('denied');

                    return $questionnaireSubmission;
                }
            })
            ->end();
    }

    /**
     * this api will call if only business owner will click on Approve button
     *
     * @param SchemaScaffolder $scaffolder SchemaScaffolder
     *
     * @return void
     */
    public function updateQuestionnaireStatusToApproved(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('updateQuestionnaireStatusToApproved', QuestionnaireSubmission::class)
            ->addArgs([
                'ID' => 'ID!',
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
                 * @throws Exception
                 * @return mixed
                 */
                public function resolve($object, array $args, $context, ResolveInfo $info)
                {
                    $questionnaireSubmission = QuestionnaireSubmission::validate_before_updating_questionnaire_submission($args['ID']);

                    $secureToken = isset($args['SecureToken']) ? Convert::raw2sql($args['SecureToken']) : '';

                    if (!empty($secureToken) && !hash_equals($questionnaireSubmission->ApprovalLinkToken, $secureToken)) {
                        throw new Exception('Wrong secure token');
                    }

                    $questionnaireSubmission->updateQuestionnaireOnApproveAndDenyByBusinessOwner('approved');

                    return $questionnaireSubmission;
                }
            })
            ->end();
    }

    /**
     * this api will call if only business owner will click on Deny button
     *
     * @param SchemaScaffolder $scaffolder SchemaScaffolder
     *
     * @return void
     */
    public function updateQuestionnaireStatusToDenied(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('updateQuestionnaireStatusToDenied', QuestionnaireSubmission::class)
            ->addArgs([
                'ID' => 'ID!',
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
                 * @throws Exception
                 * @return mixed
                 */
                public function resolve($object, array $args, $context, ResolveInfo $info)
                {
                    $questionnaireSubmission = QuestionnaireSubmission::validate_before_updating_questionnaire_submission($args['ID']);

                    $secureToken = isset($args['SecureToken']) ? Convert::raw2sql($args['SecureToken']) : '';

                    if (!empty($secureToken) && !hash_equals($questionnaireSubmission->ApprovalLinkToken, $secureToken)) {
                        throw new Exception('Wrong secure token');
                    }

                    $questionnaireSubmission->updateQuestionnaireOnApproveAndDenyByBusinessOwner('denied');

                    return $questionnaireSubmission;
                }
            })
            ->end();
    }

    /**
     * Event handler called after writing to the database.
     *
     * @return void
     */
    public function onAfterWrite()
    {
        parent::onAfterWrite();

        if (!$this->IsStartLinkEmailSent) {
            singleton(QueuedJobService::class)
                ->queueJob(
                    new SendStartLinkEmailJob($this),
                    date('Y-m-d H:i:s', time() + 30)
                );

            $this->IsStartLinkEmailSent = 1;

            $this->write();
        }
    }

    /**
     * @param DataObject $questionnaire questionnaire
     *
     * @return string $finalData
     */
    public function getQuestionsData($questionnaire)
    {
        $questions = $questionnaire->Questions();
        $finalData = [];

        foreach ($questions as $question) {
            $data['ID'] = $question->ID;
            $data['Title'] = $question->Title;
            $data['Question'] = $question->Question;
            $data['Description'] = $question->Description;
            $data['AnswerFieldType'] = $question->AnswerFieldType;
            $data['AnswerInputFields'] = $this->getAnswerInputFields($question);
            $data['AnswerActionFields'] = $this->getAnswerActionFields($question);
            $finalData[] = $data;
        }

        return json_encode($finalData, JSON_UNESCAPED_SLASHES);
    }

    /**
     * @param DataObject $question question
     *
     * @return array $finalInputFields
     */
    public function getAnswerInputFields($question)
    {
        $finalInputFields = [];

        foreach ($question->AnswerInputFields() as $answerInputField) {
            $inputFields['ID'] = $answerInputField->ID;
            $inputFields['Label'] = $answerInputField->Label;
            $inputFields['InputType'] = $answerInputField->InputType;
            $inputFields['Required'] = $answerInputField->Required;
            $inputFields['MinLength'] = $answerInputField->MinLength;
            $inputFields['PlaceHolder'] = $answerInputField->PlaceHolder;
            $inputFields['IsBusinessOwner'] = $answerInputField->IsBusinessOwner;
            $inputFields['IsProductName'] = $answerInputField->IsProductName;
            $finalInputFields[] = $inputFields;
        }

        return $finalInputFields;
    }

    /**
     * @param DataObject $question question
     *
     * @return array $finalActionFields
     */
    public function getAnswerActionFields($question)
    {
        $finalActionFields = [];

        foreach ($question->AnswerActionFields() as $answerActionField) {
            $actionFields['ID'] = $answerActionField->ID;
            $actionFields['Label'] = $answerActionField->Label;
            $actionFields['ActionType'] = $answerActionField->ActionType;
            $actionFields['Message'] = $answerActionField->Message;
            $actionFields['GotoID'] = $answerActionField->GotoID;
            $actionFields['QuestionID'] = $answerActionField->QuestionID;
            $actionFields['TaskID'] = $answerActionField->TaskID;
            $finalActionFields[] = $actionFields;
        }

        return $finalActionFields;
    }

    /**
     * @return string $link link
     */
    public function getStartLink()
    {
        $link = Convert::html2raw(Director::absoluteBaseURL(). 'Security/login?BackURL='.rawurlencode('/#/questionnaire/submission/' . $this->UUID));
        return $link;
    }

    /**
     * @return string $link link
     */
    public function getSummaryPageLink()
    {
        $link = Convert::html2raw(Director::absoluteBaseURL(). 'Security/login?BackURL='.rawurlencode('/#/questionnaire/summary/' . $this->UUID));
        return $link;
    }

    /**
     * @return string $link link
     */
    public function getApprovalPageLink()
    {
        $link = sprintf(
            "%s%s%s?token=%s",
            Director::absoluteBaseURL(),
            "businessOwnerApproval/#/questionnaire/summary/",
            $this->UUID,
            $this->ApprovalLinkToken
        );
        return Convert::html2raw($link);
    }

    /**
     * @throws Exception
     * @return void
     */
    public function doesQuestionnairBelongToCurrentUser()
    {
        $member = Security::getCurrentUser();

        if ((int)($member->ID) !== (int)($this->UserID)) {
            throw new Exception('Sorry Questionnaire Submission does not belong to login user.');
        }
    }

    /**
     * update quesionnaire business owner details and quesionnaire status and
     * send notification to the quesionnaire submitter
     *
     * @param string $status status approved/denied
     * @throws Exception
     * @return Void
     */
    public function updateQuestionnaireOnApproveAndDenyByBusinessOwner($status = '')
    {
        // check access details for Business owner
        if ($this->QuestionnaireStatus !== 'waiting_for_approval') {
            return [
                    "hasAccess" => false,
                    "message" => 'Sorry, .',
                    "group" => 'business-owner'
            ];
        }
        if ($this->BusinessOwnerApprovalStatus != "pending") {
            return [
                "hasAccess" => false,
                "message" => 'Sorry, this is already approved and denied by the Business Owner.',
                "group" => 'business-owner'
            ];
        }

        // update business owner details
        $this->updateBusinessOwnerDetail($status);

        // if approve by business owner then change questionnaire status to approved
        // else denied and send email notification to the questionnaire submitter
        if ($status == 'approved') {
            $this->QuestionnaireStatus = $status;

            // send approved email notification to the user (submitter)
            $queuedJobService = QueuedJobService::create();
            $queuedJobService->queueJob(
                new SendApprovedNotificationEmailJob($this),
                date('Y-m-d H:i:s', time() + 30)
            );
        } else {
            $this->QuestionnaireStatus = $status;

            // send denied email notification to the user (submitter)
            $queuedJobService = QueuedJobService::create();
            $queuedJobService->queueJob(
                new SendDeniedNotificationEmailJob($this),
                date('Y-m-d H:i:s', time() + 30)
            );
        }

        $this->write();
    }

    /**
     * update quesionnaire approver details based on group and permission
     *
     * @param string $status status approved/denied
     * @throws Exception
     * @return Void
     */
    public function updateQuestionnaireOnApproveAndDenyByGroup($status)
    {
        $member = Security::getCurrentUser();

        $accessDetail = $this->doesCurrentUserHasAccessToApproveDeny($member);


        if (!$accessDetail['hasAccess'] || !$accessDetail['group']) {
            throw new Exception($accessDetail['message']);
        }

        if ($accessDetail['group'] == UserGroupConstant::GROUP_CODE_SA) {
            // update Security-Architect member details
            $this->updateSecurityArchitectDetail($member, $status);

            if ($status == 'approved') {
                $this->QuestionnaireStatus = 'waiting_for_approval';

                // get CISO group member list
                $members = $this->getApprovalMembersListByGroup(UserGroupConstant::GROUP_CODE_CISO);

                // send email to CISO group and Business owner
                $qs = QueuedJobService::create();

                $qs->queueJob(
                    new SendApprovalLinkEmailJob($this, $members, $this->BusinessOwnerEmailAddress),
                    date('Y-m-d H:i:s', time() + 90)
                );
            } else {
                // if denied- no email, internal communication between Submitter and security-architect
                $this->QuestionnaireStatus = 'in_progress';

                // Mark all related task submissions as "invalid"
                $this->TaskSubmissions()->each(function (TaskSubmission $taskSubmission) {
                    $taskSubmission->Status = TaskSubmission::STATUS_INVALID;
                    $taskSubmission->write();
                });
            }

            $this->write();
        }

        // update CISO member details
        if ($accessDetail['group'] == UserGroupConstant::GROUP_CODE_CISO) {
            $this->updateCisoDetail($member, $status);
            $this->write();
        }
    }

    /**
    * update approver(Security Architect) details
    *
    * @param DataObject $member member
    * @param string     $status status
    * @return void
    */
    public function updateSecurityArchitectDetail($member = null, $status = null)
    {
        $this->SecurityArchitectApproverID = $member->ID;
        $this->SecurityArchitectApprovalStatus = $status;
        $this->SecurityArchitectStatusUpdateDate = date('Y-m-d H:i:s');

        if ($_SERVER['REMOTE_ADDR']) {
            $this->SecurityArchitectApproverIPAddress = Convert::raw2sql($_SERVER['REMOTE_ADDR']);
        }

        if (gethostname()) {
            $this->SecurityArchitectApproverMachineName = Convert::raw2sql(gethostname());
        }
    }

    /**
    * update approver (business-owner) details
    *
    * @param string $status status
    * @return void
    */
    public function updateBusinessOwnerDetail($status = null)
    {
        $this->BusinessOwnerApprovalStatus = $status;
        $this->BusinessOwnerStatusUpdateDate = date('Y-m-d H:i:s');

        if ($_SERVER['REMOTE_ADDR']) {
            $this->BusinessOwnerIPAddress = Convert::raw2sql($_SERVER['REMOTE_ADDR']);
        }
        if (gethostname()) {
            $this->BusinessOwnerMachineName = Convert::raw2sql(gethostname());
        }
    }

    /**
    * update approver details for group ciso
    *
    * @param DataObject $member member
    * @param string     $status status
    * @return void
    */
    public function updateCisoDetail($member = null, $status = null)
    {
        $this->CisoApprover = $member->ID;
        $this->CisoApprovalStatus = $status;
        $this->CisoApprovalStatusUpdateDate = date('Y-m-d H:i:s');

        if ($_SERVER['REMOTE_ADDR']) {
            $this->CisoApproverIPAddress = Convert::raw2sql($_SERVER['REMOTE_ADDR']);
        }

        if (gethostname()) {
            $this->CisoApproverMachineName = Convert::raw2sql(gethostname());
        }
    }

    /**
    * get access details for Security Architect
    *
    * @param DataObject $member member
    * @return array
    */
    public function getSecurityArchitectAccessDetail($member)
    {
        $group = UserGroupConstant::GROUP_CODE_SA;

        // check member groups
        $ismemberInGroup = $member->Groups()->filter('Code', $group)->first();

        if (!$ismemberInGroup) {
            return [
                "hasAccess" => false,
                "message" => 'Sorry, user is not belongs to Security Architect group.',
                'group' => $group
            ];
        }

        if ($this->SecurityArchitectApprovalStatus == 'pending') {
            return [
                "hasAccess" => true,
                "message" => 'Yes, current user has access to approve and denied.',
                'group' => $group
            ];
        }

        if ($this->SecurityArchitectApprovalStatus == 'approved') {
            return [
                "hasAccess" => false,
                "message" => 'Sorry, questionnaire already approved by Security Architect group member.',
                'group' => $group
            ];
        }

        if ($this->SecurityArchitectApprovalStatus == 'denied') {
            if ((int)$member->ID === (int)$this->SecurityArchitectApproverID) {
                return [
                    "hasAccess" => true,
                    "message" => 'Yes, log in member can approve and denied the questionnaire.',
                    'group' => $group
                ];
            } else {
                return [
                    "hasAccess" => false,
                    "message" => 'Sorry, questionnaire already assigned to other member of Security Architect group.',
                    'group' => $group
                ];
            }
        }

        return [
            "hasAccess" => false,
            "message" => 'Sorry, there is some problem for Security Architect approval.',
            'group' => $group
        ];
    }

    /**
    * get access details for CISO member
    *
    * @param DataObject $member member
    * @return array
    */
    public function getCISOAccessDetail($member)
    {
        $group = UserGroupConstant::GROUP_CODE_CISO;

        // check member groups
        $ismemberInGroup = $member->Groups()->filter('Code', $group)->first();

        if (!$ismemberInGroup) {
            return [
              "hasAccess" => false,
              "message" => 'Sorry, user is not belongs to CISO group.',
              'group' => $group
            ];
        }

        if ($this->CisoApprovalStatus == 'pending') {
            return [
                "hasAccess" => true,
                "message" => 'Yes, current user has access to approve and deny.',
                'group' => $group
            ];
        }

        if ($this->CisoApprovalStatus == 'approved' || $this->CisoApprovalStatus == 'denied') {
            return [
                "hasAccess" => false,
                "message" => 'Sorry, questionnaire is already approved and denied by CISO group member.',
                'group' => $group
            ];
        }

        return [
            "hasAccess" => false,
            "message" => 'Sorry, there is some problem for CISO Group Approval.',
            'group' => $group
        ];
    }

    /**
    * Check if current user has access to approve or deny (only for Security architect and CISO)
    *
    * @param DataObject $member member
    * @return array
    */
    public function doesCurrentUserHasAccessToApproveDeny($member)
    {
        // check QuestionnaireStatus
        if (in_array($this->QuestionnaireStatus, ['in_progress', 'submitted'])) {
            return [
                "hasAccess" => false,
                "message" => 'Sorry, this is not ready for review. Please contact with the submitter.',
                "group" => ''
            ];
        }

        // check access details for security architect
        if ($this->QuestionnaireStatus == 'waiting_for_security_architect_approval') {
            $accessdetails = $this->getSecurityArchitectAccessDetail($member);
            return $accessdetails;
        }

        // check access details for CISO
        if (in_array($this->QuestionnaireStatus, ['waiting_for_approval', 'denied', 'approved'])) {
            return $this->getCISOAccessDetail($member);
        }

        return [
            "hasAccess" => false,
            "message" => 'Sorry, user is not belong to approval group or user
                don\'t have access to approve and deny.',
            'group' => ''
        ];
    }

    /**
     * Check if field type is business owner
     *
     * @param array  $inputAnswerFields inputfields
     * @param string $questionsData     questions
     * @param int    $questionId        question id
     * @throws Exception
     * @return mixed
     */
    public static function is_business_owner_email_field($inputAnswerFields, $questionsData, $questionId)
    {
        foreach ($inputAnswerFields as $inputAnswerField) {
            $inputfieldDetails = QuestionnaireValidation::get_field_details($questionsData, $questionId, $inputAnswerField->id);

            if ($inputfieldDetails->InputType == 'email' && $inputfieldDetails->IsBusinessOwner) {
                return $inputAnswerField->data;
            }
        }

        return false;
    }

    /**
     * Check if field type is product name
     *
     * @param array  $inputAnswerFields inputfields
     * @param string $questionsData     questions
     * @param int    $questionId        question id
     * @throws Exception
     * @return mixed
     */
    public static function is_product_name_field($inputAnswerFields, $questionsData, $questionId)
    {
        foreach ($inputAnswerFields as $inputAnswerField) {
            $inputfieldDetails = QuestionnaireValidation::get_field_details($questionsData, $questionId, $inputAnswerField->id);

            if ($inputfieldDetails->InputType == 'text' && $inputfieldDetails->IsProductName) {
                return $inputAnswerField->data;
            }
        }

        return false;
    }

    /**
     * @param int $submissionID Questionnaire Submission ID
     *
     * @throws Exception
     * @return QuestionnaireSubmission
     */
    public static function validate_before_updating_questionnaire_submission($submissionID)
    {
        // Check submission ID
        if (empty($submissionID) || !is_numeric($submissionID)) {
            throw new Exception('Please enter a valid ID.');
        }

        // get QuestionnaireSubmission
        $questionnaireSubmission = QuestionnaireSubmission::get_by_id($submissionID);

        if (!$questionnaireSubmission) {
            throw new Exception('No data available for Questionnaire Submission. Please start again');
        }

        return $questionnaireSubmission;
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
     * @param string $group group code
     * @throws Exception
     * @return DataObject
     */
    public function getApprovalMembersListByGroup($group)
    {
        $group = Group::get()->filter('code', $group)->first();
        if ($group) {
            $members = $group->Members();
        }

        if (!$members) {
            throw new Exception('Please add member for the CISO and Security Architect group.');
        }

        return $members;
    }
}
