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
use NZTA\SDLT\GraphQL\GraphQLAuthFailure;
use NZTA\SDLT\Job\SendApprovedNotificationEmailJob;
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

/**
 * Class Questionnaire
 *
 * @property string Name
 * @property string KeyInformation
 *
 * @method Questionnaire Questionnaire()
 * @method Member User()
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
        'SubmitterRole' => 'Varchar(255)',
        'SubmitterEmail'=> 'Varchar(255)',
        'QuestionnaireData' => 'Text',
        'AnswerData' => 'Text',
        'QuestionnaireStatus' => 'Enum(array("in_progress", "submitted", "waiting_for_security_architect_approval","waiting_for_approval", "approved", "denied"))',
        'UUID' => 'Varchar(36)',
        'StartEmailSendStatus' => 'Boolean',
        'SendEmailToSecurityArchitect' => 'Boolean',
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
        'SendApprovedNotificatonToSecurityArchitect' => 'Boolean',
        'IsApprovalEmailSentToSA' => 'Boolean',
        'ApprovalLinkToken' => 'Varchar(64)',
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
        'SubmitterName',
        'SubmitterRole',
        'SubmitterEmail',
        'QuestionnaireStatus',
        'CisoApprovalStatus',
        'BusinessOwnerApprovalStatus',
        'SecurityArchitectApprovalStatus',
        'UUID',
        'StartEmailSendStatus',
        'Created' => 'Created date'
    ];

    /**
     * @var string
     */
    public static $ciso_group_code = 'sdlt-ciso';

    /**
     * @var string
     */
    public static $security_architect_group_code = 'sdlt-security-architect';

    /**
     * Default sort ordering
     *
     * @var array
     */
    private static $default_sort = ['ID' => 'DESC'];

    /**
    * @return string
    */
    public function getQuestionnaireName()
    {
        return $this->Questionnaire()->Name;
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
                'SubmitterName',
                'SubmitterRole',
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
                'SendApprovedNotificatonToSecurityArchitect',
                'IsCurrentUserAnApprover',
                'SendEmailToSecurityArchitect'
            ]);

        $submissionScaffolder
            ->nestedQuery('TaskSubmissions')
            ->setUsePagination(false)
            ->end();

        $submissionScaffolder
            ->operation(SchemaScaffolder::READ)
            ->setName('readQuestionnaireSubmission')
            ->addArg('UUID', 'String!')
            ->addArg('SecureToken', 'String')
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
                    $uuid = htmlentities(trim($args['UUID']));
                    $secureToken = isset($args['SecureToken']) ? trim($args['SecureToken']) : null;

                    // Check authentication
                    if (!$member) {
                        // if there is no member, then Validate secure token
                        if (!$secureToken) {
                            throw new GraphQLAuthFailure();
                        }
                    }

                    // Check argument
                    if (!$uuid) {
                        throw new Exception('Sorry, wrong UUID.');
                    }

                    // Filter data by UUID
                    // The questionnaire can be read by other users
                    $data = QuestionnaireSubmission::get()->where([
                        'UUID' => $uuid
                    ]);

                    // if token is not empty and is not equal approval link
                    // then throe exception
                    if (!empty($secureToken) && $data->ApprovalLinkToken != $secureToken) {
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
                    QuestionnaireSubmission::is_user_logged_in();

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
                    $model->SubmitterRole = $member->UserRole;
                    $model->SubmitterEmail = $member->Email;
                    $model->QuestionnaireStatus = 'in_progress';

                    // set approval status of BO, SA and CISO
                    $model->CisoApprovalStatus = 'pending';

                    $model->BusinessOwnerApprovalStatus = 'pending';

                    $model->SecurityArchitectApprovalStatus = 'pending';

                    $model->QuestionnaireID = $questionnaire->ID;

                    $model->UserID = $member->ID;
                    $model->StartEmailSendStatus = 0;
                    $model->SendEmailToSecurityArchitect = 0;
                    $model->SendApprovedNotificatonToSecurityArchitect = $questionnaire->SendApprovedNotificatonToSecurityArchitect;

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
                    QuestionnaireSubmission::is_user_logged_in();
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
                            QuestionnaireSubmission::validate_answer_input_data($jsonDecodeAnswerData->inputs, $questionnaireSubmission->QuestionnaireData, $args['QuestionID']);
                        }

                        if ($jsonDecodeAnswerData->answerType == "action") {
                            //validate action field
                            QuestionnaireSubmission::validate_answer_action_data($jsonDecodeAnswerData->actions, $questionnaireSubmission->QuestionnaireData, $args['QuestionID']);
                        }
                    } while (false);

                    if ($jsonDecodeAnswerData->answerType == "input") {
                        // check if input field is business owner email field
                        $businessOwnerEmail = QuestionnaireSubmission::is_business_owner_email_field(
                            $jsonDecodeAnswerData->inputs,
                            $questionnaireSubmission->QuestionnaireData,
                            $args['QuestionID']
                        );

                        // if it is business owner email field, then add product owner email address
                        if (!is_bool($businessOwnerEmail)) {
                            $questionnaireSubmission->BusinessOwnerEmailAddress = $businessOwnerEmail;
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
                    QuestionnaireSubmission::is_user_logged_in();

                    $questionnaireSubmission = QuestionnaireSubmission::validate_before_updating_questionnaire_submission($args['ID']);

                    $questionnaireSubmission->doesQuestionnairBelongToCurrentUser();

                    $questionnaireSubmission->QuestionnaireStatus = 'submitted';

                    $questionnaireSubmission->write();

                    // after submit the questionnaire, please send a summary page link
                    // to the submitter
                    $queuedJobService = QueuedJobService::create();

                    $queuedJobService->queueJob(
                        new SendSummaryPageLinkEmailJob($questionnaireSubmission),
                        date('Y-m-d H:i:s', time() + 30)
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
                    QuestionnaireSubmission::is_user_logged_in();

                    $questionnaireSubmission = QuestionnaireSubmission::validate_before_updating_questionnaire_submission($args['ID']);

                    $questionnaireSubmission->doesQuestionnairBelongToCurrentUser();

                    $questionnaireSubmission->QuestionnaireStatus = 'in_progress';

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
                    QuestionnaireSubmission::is_user_logged_in();

                    $questionnaireSubmission = QuestionnaireSubmission::validate_before_updating_questionnaire_submission($args['ID']);

                    $questionnaireSubmission->doesQuestionnairBelongToCurrentUser();

                    $questionnaireSubmission->QuestionnaireStatus = 'waiting_for_security_architect_approval';

                    if (!$questionnaireSubmission->SendEmailToSecurityArchitect) {
                        $members = $questionnaireSubmission->getApprovalMembersListByGroup(QuestionnaireSubmission::$security_architect_group_code);

                        if (!$members) {
                            throw new Exception('Please add member in Security architect group.');
                        }

                        $questionnaireSubmission->SendEmailToSecurityArchitect = 1;

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
                    QuestionnaireSubmission::is_user_logged_in();

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
                    QuestionnaireSubmission::is_user_logged_in();

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

        if (!$this->StartEmailSendStatus) {
            singleton(QueuedJobService::class)
                ->queueJob(
                    new SendStartLinkEmailJob($this),
                    date('Y-m-d H:i:s', time() + 30)
                );

            $this->StartEmailSendStatus = 1;

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
        $link = Convert::html2raw(Director::absoluteBaseURL(). '#/questionnaire/submission/' . $this->UUID);
        return $link;
    }

    /**
     * @return string $link link
     */
    public function getSummaryPageLink()
    {
        $link = Convert::html2raw(Director::absoluteBaseURL(). '#/questionnaire/summary/' . $this->UUID);
        return $link;
    }

    /**
     * @return string $link link
     */
    public function getApprovalPageLink()
    {
        $link = Convert::html2raw(Director::absoluteBaseURL(). "businessOwnerApproval/#/questionnaire/summary/{$this->UUID}?token={$this->ApprovalLinkToken}");
        return $link;
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
                date('Y-m-d H:i:s', time() + 90)
            );
        } else {
            $this->QuestionnaireStatus = $status;

            // send denied email notification to the user (submitter)
            $queuedJobService = QueuedJobService::create();
            $queuedJobService->queueJob(
                new SendDeniedNotificationEmailJob($this),
                date('Y-m-d H:i:s', time() + 90)
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

        if ($accessDetail['group'] == QuestionnaireSubmission::$security_architect_group_code) {
            // update Security-Architect member details
            $this->updateSecurityArchitectDetail($member, $status);

            if ($status == 'approved') {
                $this->QuestionnaireStatus = 'waiting_for_approval';

                // get CISO group member list
                $members = $this->getApprovalMembersListByGroup(QuestionnaireSubmission::$ciso_group_code);

                // send email to CISO group and Business owner
                $qs = QueuedJobService::create();

                $qs->queueJob(
                    new SendApprovalLinkEmailJob($this, $members, $this->BusinessOwnerEmailAddress),
                    date('Y-m-d H:i:s', time() + 90)
                );
            } else {
                // if denied- no email, internal communication between Submitter and security-architect
                $this->QuestionnaireStatus = 'in_progress';
            }

            $this->write();
        }

        // update CISO member details
        if ($accessDetail['group'] == QuestionnaireSubmission::$ciso_group_code) {
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
        $group = QuestionnaireSubmission::$security_architect_group_code;

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
        $group = QuestionnaireSubmission::$ciso_group_code;

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
    * @param array  $actionFields  actionFields
    * @param string $questionsData questions
    * @param int    $questionID    question id
    * @throws Exception
    * @return void
    */
    public static function validate_answer_action_data($actionFields, $questionsData, $questionID)
    {
        foreach ($actionFields as $actionField) {
            $actionFieldDetails = QuestionnaireSubmission::get_field_details($questionsData, $questionID, $actionField->id);

            if (!$actionFieldDetails) {
                throw new Exception(
                    sprintf(
                        'Sorry, no data available for action field ID: %d',
                        $actionField->id
                    )
                );
            }

            if (!is_bool($actionField->isChose)) {
                throw new Exception(
                    sprintf(
                        'Sorry, answer type should be boolean for action field ID: %d',
                        $actionField->id
                    )
                );
            }
        }
    }

    /**
     * @param array  $inputAnswerfields inputfields
     * @param string $questionsData     questions
     * @param int    $questionID        question id
     * @throws Exception
     * @return void
     */
    public static function validate_answer_input_data($inputAnswerfields, $questionsData, $questionID)
    {
        foreach ($inputAnswerfields as $inputAnswerfield) {
            $inputfieldDetails = QuestionnaireSubmission::get_field_details($questionsData, $questionID, $inputAnswerfield->id);

            if (!$inputfieldDetails) {
                throw new Exception(
                    sprintf(
                        'Sorry, no data available for input field ID: %d',
                        $inputfieldArr['id']
                    )
                );
            }

            self::validate_input_field($inputAnswerfield->data, $inputfieldDetails);

            if ($inputfieldDetails->InputType == 'email') {
                self::validate_email_field($inputAnswerfield->data, $inputfieldDetails);
            }

            if ($inputfieldDetails->InputType == 'date') {
                self::validate_date_field($inputAnswerfield->data, $inputfieldDetails);
            }
        }
    }

    /**
     * @param string $questionsData questions
     * @param int    $questionID    question id
     * @param int    $fieldID       input or action field id
     * @throws Exception
     * @return mixed $currentField current field or null
     */
    public static function get_field_details($questionsData, $questionID, $fieldID)
    {
        $questions = json_decode($questionsData);
        $currentQuestion = null;
        $currentField = null;

        foreach ($questions as $question) {
            if ((int)$question->ID === (int)$questionID) {
                $currentQuestion = $question;
            }
        }

        if (!$currentQuestion) {
            throw new Exception(
                sprintf(
                    'Sorry, no question available for question Id: %d',
                    $questionID
                )
            );
        }

        if ($currentQuestion->AnswerFieldType == 'input') {
            $fields = $currentQuestion->AnswerInputFields;
        } else {
            $fields = $currentQuestion->AnswerActionFields;
        }

        if (!$fields) {
            throw new Exception(
                sprintf(
                    'Sorry, no fields available question Id: %d',
                    $questionID
                )
            );
        }

        foreach ($fields as $field) {
            if ((int)$field->ID === (int)$fieldID) {
                $currentField = $field;
            }
        }

        return $currentField;
    }

    /**
     * @param string     $data              answer data
     * @param DataObject $inputfieldDetails inputfieldsDetails
     * @throws Exception
     * @return void
     */
    public static function validate_input_field($data, $inputfieldDetails)
    {
        // validate required field
        if ($inputfieldDetails->Required && empty($data)) {
            throw new Exception(
                sprintf(
                    '%s is required.',
                    $inputfieldDetails->Label
                )
            );
        }

        // validate minimum length
        if ($inputfieldDetails->MinLength > 0 &&
            strlen($data) < $inputfieldDetails->MinLength) {
            throw new Exception(
                sprintf(
                    'Please enter a value with at least %d characters for %s.',
                    $inputfieldDetails->MinLength,
                    $inputfieldDetails->Label
                )
            );
        }
    }

    /**
     * @param string     $email             email
     * @param DataObject $inputfieldDetails inputfieldsDetails
     * @throws Exception
     * @return void
     */
    public static function validate_email_field($email, $inputfieldDetails)
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception(
                sprintf(
                    'Please enter valid email address for the %s.',
                    $inputfieldDetails->Label
                )
            );
        }
    }

    /**
     * @param array  $inputAnswerFields inputfields
     * @param string $questionsData     questions
     * @param int    $questionId        question id
     * @throws Exception
     * @return mixed
     */
    public static function is_business_owner_email_field($inputAnswerFields, $questionsData, $questionId)
    {
        foreach ($inputAnswerFields as $inputAnswerField) {
            $inputfieldDetails = QuestionnaireSubmission::get_field_details($questionsData, $questionId, $inputAnswerField->id);

            if ($inputfieldDetails->InputType == 'email' && $inputfieldDetails->IsBusinessOwner) {
                return $inputAnswerField->data;
            }
        }

        return false;
    }

    /**
     * @param string     $date              date
     * @param DataObject $inputfieldDetails inputfieldsDetails
     * @throws Exception
     * @return void
     */
    public static function validate_date_field($date, $inputfieldDetails)
    {
        $dateExploded = explode("-", $date);

        if (count($dateExploded) != 3) {
            throw new Exception(
                sprintf(
                    'Please enter valid date format for the %s.',
                    $inputfieldDetails->Label
                )
            );
        }

        //For the sake of clarity, lets assign our array elements to
        //named variables (day, month, year).
        $year = $dateExploded[0];
        $month = $dateExploded[1];
        $day = $dateExploded[2];

        //Finally, use PHP's checkdate function to make sure
        //that it is a valid date and that it actually occured.
        if (!checkdate($month, $day, $year)) {
            throw new Exception($date . ' is not a valid date.');
        }

        if (strlen($year) !== 4) {
            throw new Exception('Please enter a valid year like 2019.');
        }
    }

    /**
     * @throws GraphQLAuthFailure
     * @return void
     */
    public static function is_user_logged_in()
    {
        $member = Security::getCurrentUser();

        // Check authentication
        if (!$member) {
            throw new GraphQLAuthFailure();
        }
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
