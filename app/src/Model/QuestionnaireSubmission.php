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
use SilverStripe\ORM\HasManyList;
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
use SilverStripe\Forms\FormAction;
use SilverStripe\Control\Controller;
use SilverStripe\Forms\TextField;
use SilverStripe\Forms\FormField;
use NZTA\SDLT\Traits\SDLTRiskSubmission;

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
    use SDLTRiskSubmission;

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
        'QuestionnaireStatus' => 'Enum(array("in_progress", "submitted", "awaiting_security_architect_review", "waiting_for_security_architect_approval","waiting_for_approval", "approved", "denied"))',
        'UUID' => 'Varchar(36)',
        'IsStartLinkEmailSent' => 'Boolean',
        'IsEmailSentToSecurityArchitect' => 'Boolean',
        'IsSubmitLinkEmailSent' => 'Boolean',
        'CisoApprovalStatus' => 'Enum(array("not_applicable", "pending", "approved", "denied", "not_required"))',
        'CisoApproverIPAddress' => 'Varchar(255)',
        'CisoApproverMachineName' => 'Varchar(255)',
        'CisoApprovalStatusUpdateDate' => 'Varchar(255)',
        'BusinessOwnerApprovalStatus' => 'Enum(array("not_applicable", "pending", "approved", "denied", "not_required"))',
        'BusinessOwnerMachineName' => 'Varchar(255)',
        'BusinessOwnerStatusUpdateDate' => 'Varchar(255)',
        'BusinessOwnerIPAddress' => 'Varchar(255)',
        'BusinessOwnerEmailAddress' => 'Varchar(255)',
        'BusinessOwnerName' => 'Varchar(255)',
        'SecurityArchitectApprovalStatus' => 'Enum(array("not_applicable", "pending", "approved", "denied"))',
        'SecurityArchitectApproverIPAddress' => 'Varchar(255)',
        'SecurityArchitectApproverMachineName' => 'Varchar(255)',
        'SecurityArchitectStatusUpdateDate' => 'Varchar(255)',
        'ApprovalLinkToken' => 'Varchar(64)',
        'ProductName' => 'Varchar(255)',
        'ApprovalOverrideBySecurityArchitect' => 'Boolean',
        'QuestionnaireLevelTaskIDs' => 'Varchar(255)',
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
        'QuestionnaireName' => 'Questionnaire Name',
        'QuestionnaireType' => 'Questionnaire Type',
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
            'Root.Links',
            [
                TextField::create(
                    'SecureLink',
                    'Secure link'
                )
                    ->setValue($this->getSummaryPageLink())
                    ->setReadonly(true)
                    ->setDescription('This is the link emailed to authenticated'
                        .' users of the application'),
                TextField::create(
                    'AnonymousLink',
                    'Anonymous access link'
                )
                      ->setValue($this->getApprovalPageLink())
                      ->setReadonly(true)
                      ->setDescription('This is the link emailed to anonymous users'
                        .' of the application. Anyone possessing the link can view'
                        .' the submission')
            ]
        );

        $fields->addFieldsToTab(
            'Root.QuestionnaireAnswerData',
            [
                $fields->dataFieldByName('QuestionnaireData'),
                $fields->dataFieldByName('AnswerData'),
                $fields->dataFieldByName('QuestionnaireLevelTaskIDs')
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

        // memeber list for SA group
        $group = Group::get()->filter('code', UserGroupConstant::GROUP_CODE_SA)->first();

        $saMemberList = [];

        if ($group) {
            $saMemberList = $group->Members();
        }

        $fields->addFieldsToTab(
            'Root.SecurityArchitectDetails',
            [
                $fields->dataFieldByName('SecurityArchitectApproverID')->setSource($saMemberList),
                $fields->dataFieldByName('SecurityArchitectApprovalStatus'),
                $fields->dataFieldByName('SecurityArchitectApproverIPAddress'),
                $fields->dataFieldByName('SecurityArchitectApproverMachineName'),
                $fields->dataFieldByName('SecurityArchitectStatusUpdateDate'),
                $fields->dataFieldByName('IsEmailSentToSecurityArchitect')
            ]
        );

        // memeber list for CISO group
        $group = Group::get()->filter('code', UserGroupConstant::GROUP_CODE_CISO)->first();

        $cisoMemberList = [];

        if ($group) {
            $cisoMemberList = $group->Members();
        }
        $fields->addFieldsToTab(
            'Root.CisoDetails',
            [
                $fields->dataFieldByName('CisoApproverID')->setSource($cisoMemberList),
                $fields->dataFieldByName('CisoApprovalStatus'),
                $fields->dataFieldByName('CisoApproverIPAddress'),
                $fields->dataFieldByName('CisoApproverMachineName'),
                $fields->dataFieldByName('CisoApprovalStatusUpdateDate')
            ]
        );

        $isBusinessOwnerName = $fields->dataFieldByName('BusinessOwnerName');
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

        if (isset($isBusinessOwnerName)) {
            $fields->addFieldsToTab('Root.BusinessOwnerDetails', $isBusinessOwnerName);
        }

        $fields
            ->dataFieldByName('ApprovalOverrideBySecurityArchitect')
            ->setTitle('Allow BO and CISO approval skipping');

        return $fields;
    }

    /**
     * CMS Actions
     * @return FieldList
     */
    public function getCMSActions()
    {
        $actions = parent::getCMSActions();
        $resendEmailAction = FormAction::create('resendEmail', 'Resend Email');
        $member = Security::getCurrentUser();

        if ($member && !$member->getIsReporter()) {
            $actions->push($resendEmailAction);
        }

        return $actions;
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
    public function getQuestionnaireType()
    {
        return FormField::name_to_label($this->Questionnaire()->Type ?? 'Questionnaire');
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
     * Determines if a particular operation was performed by a Business Owner.
     * This check is reliant on information provided by both the data-model and
     * the current GraphQL {@link HTTPRequest} object.
     *
     * @return boolean
     */
    public function isBusinessOwnerContext()
    {
        $member = Security::getCurrentUser();

        if ($member) {
            $changed = $this->getChangedFields(['QuestionnaireStatus'], 1);
            // check access details for business owner
            if (array_key_exists('QuestionnaireStatus', $changed) && $changed['QuestionnaireStatus']['before'] === 'waiting_for_approval' &&
                in_array($changed['QuestionnaireStatus']['after'], ['approved', 'denied']) &&
                $member->Email == $this->BusinessOwnerEmailAddress) {
                return true;
            }
        }

        $req = Controller::curr() ? Controller::curr()->getRequest() : null;

        return (
            $this->UUID &&
            $this->ApprovalLinkToken && (
                $req &&
                strstr($req->getHeader('referer'), 'businessOwnerApproval') &&
                strstr($req->getBody(), $this->ApprovalLinkToken)
            )
        );
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
                'Created',
                'BusinessOwnerApproverName',
                'ApprovalOverrideBySecurityArchitect',
                'GQRiskResult',
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
                    $uuid = isset($args['UUID']) ? htmlentities(trim($args['UUID'])) : null;
                    $userID = isset($args['UserID']) ? htmlentities(trim($args['UserID'])) : null;
                    $secureToken = isset($args['SecureToken']) ? Convert::raw2sql(trim($args['SecureToken'])) : null;
                    $isBusinessOwnerSummaryPage= isset($args['IsBusinessOwnerSummaryPage']) ? Convert::raw2sql(trim($args['IsBusinessOwnerSummaryPage'])) : '0';
                    $pageType= isset($args['PageType']) ? Convert::raw2sql(trim($args['PageType'])) : '';

                    // To continue the data fetching, user has to be logged-in or has secure token
                    if (!$member && !$secureToken) {
                        throw new GraphQLAuthFailure();
                    }

                    // Check argument
                    if (!$uuid && !$userID) {
                        throw new Exception('Sorry, there is no UUID or user Id.');
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
                    $data = [];
                    if ($uuid) {
                        $data = QuestionnaireSubmission::get()->filter(['UUID' => $uuid])->first();
                    }

                    if ($userID && $pageType == 'awaiting_approval_list') {

                        if ($member->getIsSA() && $member->getIsCISO()) {
                            $status = [
                              'awaiting_security_architect_review',
                              'waiting_for_security_architect_approval',
                              'waiting_for_approval',
                              'approved',
                              'pending'
                            ];

                            $data = QuestionnaireSubmission::get()->filter([
                                'QuestionnaireStatus' => $status
                            ])->filterAny([
                                'SecurityArchitectApprovalStatus' => "pending",
                                'CisoApprovalStatus' => "pending"
                            ]);

                            // @todo : We might need below commented code for story:-
                            // Do not allow  an SA or CISO who has already approved
                            // a submission to also approve it as a business owner
                            // https://redmine.catalyst.net.nz/issues/64290
                            // all three approvals should come from distinct people
                            // ->exclude([
                            //     'QuestionnaireStatus' => 'waiting_for_approval',
                            //     'SecurityArchitectApproverID' => $userID
                            // ]);
                        } else if ($member->getIsSA()) {
                            $data = QuestionnaireSubmission::get()->filter([
                                'QuestionnaireStatus' => ['awaiting_security_architect_review', 'waiting_for_security_architect_approval'],
                                'SecurityArchitectApprovalStatus' => "pending"
                            ]);
                        } else if ($member->getIsCISO()) {
                            $data = QuestionnaireSubmission::get()->filter([
                                'QuestionnaireStatus' => ['waiting_for_approval', 'approved', 'pending'],
                                'CisoApprovalStatus' => "pending"
                            ]);
                        } else {
                            // @todo : We might need to change this logic in future for Story:-
                            // Change behaviour of Business Owner approval Token
                            // https://redmine.catalyst.net.nz/issues/66788
                            $data = QuestionnaireSubmission::get()->filter([
                                'QuestionnaireStatus' => 'waiting_for_approval',
                                'BusinessOwnerApprovalStatus' => "pending",
                                'BusinessOwnerEmailAddress' =>$member->Email
                            ]);
                        }
                    }

                    // data for my sumission list
                    if ($userID && $pageType == 'my_submission_list') {
                        $data = QuestionnaireSubmission::get()->filter(['UserID' => $userID]);
                    }

                    // data for my product list
                    if ($userID && $pageType == 'my_product_list') {
                        $data = QuestionnaireSubmission::get()->filter([
                            'BusinessOwnerEmailAddress' => $member->Email
                        ]);
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
        $this->updateQuestionnaireStatusToAssignToSecurityArchitect($scaffolder);
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

                    $questionnaireLevelTaskIDs = $questionnaire->Tasks()->column('ID');
                    $model->QuestionnaireLevelTaskIDs = $questionnaireLevelTaskIDs
                        ? json_encode($questionnaireLevelTaskIDs)
                        : '';

                    $uuid = Uuid::uuid4();
                    $model->UUID = (string) $uuid;

                    $model->ApprovalOverrideBySecurityArchitect = $model->isApprovalOverriddenBy();

                    $model->ApprovalLinkToken = hash('sha3-256', random_bytes(64));

                    $model->QuestionnaireData = json_encode($questionnaire->getQuestionsData());
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
                        $jsonAnswerDataArr = [];

                        if (isset($jsonDecodeAnswerData->inputs)) {
                            $jsonAnswerDataArr = $jsonDecodeAnswerData->inputs;
                        }

                        // check if input field is business owner email field
                        $businessOwnerEmail = QuestionnaireSubmission::is_field_type_exist(
                            $jsonAnswerDataArr,
                            $questionnaireSubmission->QuestionnaireData,
                            $args['QuestionID'],
                            'email',
                            'IsBusinessOwner'
                        );

                        // if it is business owner email field, then add product owner email address
                        if (!is_bool($businessOwnerEmail)) {
                            $questionnaireSubmission->BusinessOwnerEmailAddress = $businessOwnerEmail;
                        }

                        $isProductName = QuestionnaireSubmission::is_field_type_exist(
                            $jsonAnswerDataArr,
                            $questionnaireSubmission->QuestionnaireData,
                            $args['QuestionID'],
                            'text',
                            'IsProductName'
                        );

                        // if it is product name text field, then add product name
                        if (is_string($isProductName)) {
                            $questionnaireSubmission->ProductName = $isProductName;
                        }

                        //BusinessOwnerName
                        $isBusinessOwnerName = QuestionnaireSubmission::is_field_type_exist(
                            $jsonAnswerDataArr,
                            $questionnaireSubmission->QuestionnaireData,
                            $args['QuestionID'],
                            'text',
                            'IsBusinessOwnerName'
                        );

                        // if it is Business owner name text field, then add Business owner name
                        if (is_string($isBusinessOwnerName)) {
                            $questionnaireSubmission->BusinessOwnerName = $isBusinessOwnerName;
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
     * updateQuestionnaireStatusToSubmitted. This endpoint is called when users
     * click on a submit button. After completion, users can modify their answers.
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

                    Question::create_task_submissions_according_to_answers(
                        $questionnaireSubmission->QuestionnaireData,
                        $questionnaireSubmission->AnswerData,
                        $questionnaireSubmission->ID,
                        $questionnaireSubmission->QuestionnaireLevelTaskIDs
                    );

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
    public function updateQuestionnaireStatusToAssignToSecurityArchitect(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('updateQuestionnaireStatusToAssignToSecurityArchitect', QuestionnaireSubmission::class)
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

                    $questionnaireSubmission->QuestionnaireStatus = 'awaiting_security_architect_review';

                    if ($questionnaireSubmission->SecurityArchitectApprovalStatus == 'denied') {
                        $questionnaireSubmission->QuestionnaireStatus = 'waiting_for_security_architect_approval';
                    }

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
                    $member = QuestionnaireValidation::is_user_logged_in();

                    $questionnaireSubmission = QuestionnaireSubmission::validate_before_updating_questionnaire_submission($args['ID']);

                    $questionnaireSubmission->QuestionnaireStatus = 'waiting_for_security_architect_approval';

                    $questionnaireSubmission->updateSecurityArchitectDetail($member, 'pending');

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
                'SkipBoAndCisoApproval' => 'Boolean',
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

                    $skipBoAndCisoApproval = false;

                    if (isset($args['SkipBoAndCisoApproval'])) {
                        $skipBoAndCisoApproval = $args['SkipBoAndCisoApproval'];
                    }

                    $questionnaireSubmission = QuestionnaireSubmission::validate_before_updating_questionnaire_submission($args['ID']);

                    $questionnaireSubmission->updateQuestionnaireOnApproveAndDenyByGroup('approved', $skipBoAndCisoApproval);

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
                'SkipBoAndCisoApproval' => 'Boolean',
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

                    $skipBoAndCisoApproval = false;

                    if (isset($args['SkipBoAndCisoApproval'])) {
                        $skipBoAndCisoApproval = $args['SkipBoAndCisoApproval'];
                    }

                    $questionnaireSubmission->updateQuestionnaireOnApproveAndDenyByGroup('denied', $skipBoAndCisoApproval);

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
     * Deal with pre-write processes.
     *
     * @return void
     */
    public function onBeforeWrite()
    {
        parent::onBeforeWrite();

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
        $approvalDbFields = self::normalise_group_approval_fields(
            $user,
            $this->isBusinessOwnerContext()
        );
        $userData = '';

        if ($user) {
            $groups = $user->Groups()->column('Title');
            $userData = implode('. ', [
                'Email: ' . (($this->isBusinessOwnerContext() && $this->BusinessOwnerEmailAddress) ?
                    $this->BusinessOwnerEmailAddress :
                    $user->Email),
                'Group(s): ' . ($groups ? implode(' : ', $groups) : 'N/A'),
            ]);
        } else {
            $userData = implode('. ', [
                'Email: ' . (($this->isBusinessOwnerContext() && $this->BusinessOwnerEmailAddress) ?
                    $this->BusinessOwnerEmailAddress :
                    'N/A'),
                'Group(s): N/A',
            ]);
        }

        // Auditing: SUBMIT, when:
        // - User is present AND
        // - Submission is new
        $doAudit = !$this->exists() && $user;

        if ($doAudit) {
            $msg = sprintf('"%s" was submitted. (UUID: %s)', $this->Questionnaire()->Name, $this->UUID);
            $this->auditService->commit('Submit', $msg, $this, $userData);
        }

        // Auditing: SUBMIT, when:
        // - User is present AND
        // - Submission exists AND
        // - Status changes from anything to "pending"
        $changed = $this->getChangedFields();
        $doAudit = false;
        $statusChange = [];

        foreach ($approvalDbFields as $approvalFieldName) {
            if (
                    $this->exists() &&
                    $user &&
                    isset($changed[$approvalFieldName]) &&
                    $changed[$approvalFieldName]['before'] !== 'in_progress' &&
                    $changed[$approvalFieldName]['after'] === 'in_progress') {
                $doAudit = true;
                $statusChange['before'] = $changed[$approvalFieldName]['before'];
                $statusChange['after'] = $changed[$approvalFieldName]['after'];
                break;
            }
        }

        if ($doAudit) {
            $msg = sprintf(
                '"%s" had its status changed from "%s" to "%s". (UUID: %s)',
                $this->Questionnaire()->Name,
                $statusChange['before'] ?: 'start' ,
                $statusChange['after'],
                $this->UUID
            );
            $this->auditService->commit('Change', $msg, $this, $userData);
        }

        // Auditing: APPROVE|DENY, when:
        // - User is present AND
        // - Submission exists AND
        // - User is in Security Architects or CISO group(s) OR is a "Business Owner"
        // - Status is "approved" or status is "denied"
        $doAudit = false;

        foreach ($approvalDbFields as $approvalFieldName) {
            if (
                    $this->exists() &&
                    in_array($this->$approvalFieldName, ['approved', 'denied']) && (
                        $this->isBusinessOwnerContext() || (
                            $user && (
                                $user->getIsCISO() ||
                                $user->getIsSA()
                            )
                    ))) {
                $doAudit = true;
                break;
            }
        }

        if ($doAudit) {
            $msg = sprintf('"%s" was %s. (UUID: %s)', $this->Questionnaire()->Name, $this->$approvalFieldName, $this->UUID);
            $status = ($this->$approvalFieldName === 'approved') ? 'Approve' : 'Deny';
            $this->auditService->commit($status, $msg, $this, $userData);
        }
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
            $actionFields['GotoID'] = $answerActionField->Goto()->ID;
            $actionFields['QuestionID'] = $answerActionField->Question()->ID;
            $actionFields['TaskID'] = $answerActionField->Task()->ID;
            $finalActionFields[] = $actionFields;
        }
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
     * @param string  $status                status        approved/denied
     * @param boolean $skipBoAndCisoApproval skip approval true/false
     * @throws Exception
     * @return Void
     */
    public function updateQuestionnaireOnApproveAndDenyByGroup($status, $skipBoAndCisoApproval = false)
    {
        $member = Security::getCurrentUser();

        $accessDetail = $this->doesCurrentUserHasAccessToApproveDeny($member);

        if (!$accessDetail['hasAccess'] || !$accessDetail['group']) {
            throw new Exception($accessDetail['message']);
        }

        // update SA member details
        if ($accessDetail['group'] == UserGroupConstant::GROUP_CODE_SA) {

            // update Security-Architect member details
            $this->updateSecurityArchitectDetail($member, $status);

            if ($status == 'approved') {
                // skipBoAndCisoApproval is not set then send email to CISO and BO
                // else skip the CISO and BO approval and chane questionnaire status to approved
                if (!$skipBoAndCisoApproval) {
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
                    $this->QuestionnaireStatus = $status;

                    $this->CisoApprovalStatus = 'not_required';
                    $this->BusinessOwnerApprovalStatus = 'not_required';

                    // send approved email notification to the user (submitter)
                    $queuedJobService = QueuedJobService::create();
                    $queuedJobService->queueJob(
                        new SendApprovedNotificationEmailJob($this),
                        date('Y-m-d H:i:s', time() + 30)
                    );
                }
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
        else if ($accessDetail['group'] == UserGroupConstant::GROUP_CODE_CISO) {
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
            if ($this->QuestionnaireStatus == 'waiting_for_security_architect_approval') {
                if ((int)$member->ID === (int)$this->SecurityArchitectApproverID) {
                    return [
                        "hasAccess" => true,
                        "message" => 'Yes, current user has access to approve and denied.',
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
        if (in_array($this->QuestionnaireStatus, ['awaiting_security_architect_review', 'waiting_for_security_architect_approval'])) {
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
     * Check if field type is business owner, product name or business owner name
     *
     * @param array  $inputAnswerFields inputfields
     * @param string $questionsData     questions
     * @param int    $questionId        question id
     * @param string $fieldType         Field Type
     * @param string $fieldName         Field Name
     * @throws Exception
     * @return mixed
     */
    public static function is_field_type_exist($inputAnswerFields, $questionsData, $questionId, $fieldType, $fieldName)
    {
        foreach ($inputAnswerFields as $inputAnswerField) {
            $inputfieldDetails = QuestionnaireValidation::get_field_details(
                $questionsData,
                $questionId,
                $inputAnswerField->id
            );

            // check if $fieldname exists before accessing it
            if (!isset($inputfieldDetails->$fieldName)) {
                continue;
            }

            if ($inputfieldDetails->InputType == $fieldType && $inputfieldDetails->$fieldName) {
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
     * Allow logged-in user to delete the object
     *
     * @param Member|null $member member
     * @return bool
     */
    public function canDelete($member = null)
    {
        return false;
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

    /**
     * @return string
     */
    public function getBusinessOwnerApproverName()
    {
        if (!empty($this->BusinessOwnerName)) {
            return $this->BusinessOwnerName;
        } else {
            return $this->BusinessOwnerEmailAddress;
        }
    }

    /**
     * create questionnaire level task
     *
     * @param DataObject $questionnaire questionnaire
     *
     * @return void
     */
    public function createTasks($questionnaire)
    {
        $tasks = $questionnaire->Tasks();

        foreach ($tasks as $task) {
            $taskSubmission = TaskSubmission::create_task_submission(
                $task->ID,
                $this->ID,
                $this->User->ID
            );
        }
    }

    /**
     * Return the appropriate approval DB field(s), based on the passed user's groups
     * or status as a "Business Owner".
     *
     * @param Member  $member          The user whose groups we want to normalise.
     * @param boolean $isBusinessOwner Set in userland code and flags a user as
     *                                 being a Business Owner.
     * @return array
     */
    public static function normalise_group_approval_fields(Member $member = null, bool $isBusinessOwner = false) : array
    {
        $fields = ['QuestionnaireStatus'];

        if (!$member) {
            if (!$isBusinessOwner) {
                return $fields;
            }

            return $fields;
        }

        if ($isBusinessOwner) {
            $fields[] = 'BusinessOwnerApprovalStatus';
        }

        $member->Groups()->each(function ($group) use (&$fields) : void {
            $normalised = '';

            // Convert the Groups.Code value
            foreach (explode('-', $group->Code) as $part) {
                if ($part !== 'sdlt') {
                    $normalised .= ucfirst(strtolower($part));
                }
            }

            $fields[] = sprintf('%sApprovalStatus', $normalised);
        });

        sort($fields);

        return $fields;
    }

    /**
     * Determine if the current submission is for a {@link Questionnaire} whose
     * {@link Pillar} has been set to override by SecurityArchitect
     *
     * @return boolean
     */
    public function isApprovalOverriddenBy() : bool
    {
        $pillar = $this->Questionnaire()->Pillar();

        if ($pillar->exists()) {
            return $pillar->ApprovalOverrideBySecurityArchitect;
        }

        return false;
    }

    /**
     * A graphql frontend for the getRiskResult() method.
     *
     * @return string
     */
    public function GQRiskResult() : string
    {
        return json_encode($this->getRiskResultData());
    }

    /**
     * Wrap the related questionnaire's risk-data alongside those of all its
     * related tasks.
     *
     * @return array
     */
    public function getRiskResultData() : array
    {
        // Deal with the related Questionnaire's Task-calcs, and append them
        $allRiskResults = [];

        // for questionnaire
        if ($this->QuestionnaireStatus !== "in_progress") {
            $allRiskResults = $this->getRiskResult('q');
        }

        // for task
        $taskSubmissions = $this->TaskSubmissions()->filter([
            'Status:not' => ["start", "in_progress", "invalid"]
        ]);

        foreach ($taskSubmissions as $taskSubmission) {
            if ($result = $taskSubmission->getRiskResult('t')) {
                $allRiskResults = array_merge($allRiskResults, $result);
            }
        }

        return $allRiskResults;
    }

}
