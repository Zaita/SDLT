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
        'QuestionnaireStatus' => 'Enum(array("in_progress", "submitted", "waiting_for_security_architect_approval","waiting_for_approval" "approved", "denied"))',
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
        'SecurityArchitectApprovalStatus' => 'Enum(array("not_applicable", "pending", "approved", "denied"))',
        'SecurityArchitectApproverIPAddress' => 'Varchar(255)',
        'SecurityArchitectApproverMachineName' => 'Varchar(255)',
        'SecurityArchitectStatusUpdateDate' => 'Varchar(255)',
        'SendApprovedNotificatonToSecurityArchitect' => 'Boolean',
        'IsApprovalEmailSentToSA' => 'Boolean',
    ];

    /**
     * @var array
     */
    private static $has_one = [
        'User' => Member::class,
        'Questionnaire' => Questionnaire::class,
        'CisoApprover' => Member::class,
        'SecurityArchitectApprover' => Member::class,
        'BusinessOwner' => Member::class,
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
                'BusinessOwner',
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
            ->operation(SchemaScaffolder::READ)
            ->setName('readQuestionnaireSubmission')
            ->addArg('UUID', 'String!')
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

                    // Check authentication
                    if (!$member) {
                        throw new Exception('Please log in first...');
                    }

                    // Check argument
                    if (!$uuid) {
                        throw new Exception('Sorry, wrong UUID.');
                    }

                    // Filter data by UUID
                    // The questionnaire can be read by other users
                    // TODO: we may limit the access to "submitter", "business owner" and "chief security officer"
                    $data = QuestionnaireSubmission::get()->where([
                        'UUID' => $uuid
                    ]);

                    return $data;
                }
            })
            ->end();

        $this->createQuestionnaireSubmission($scaffolder);
        $this->updateQuestionnaireSubmission($scaffolder);
        $this->updateQuestionnaireStatusToSubmitted($scaffolder);
        $this->updateQuestionnaireStatusToInProgress($scaffolder);
        $this->updateQuestionnaireStatusToWaitingForSecurityArchitectApproval($scaffolder);
        $this->updateQuestionnaireStatusToApproved($scaffolder);
        $this->updateQuestionnaireStatusToDenied($scaffolder);

        return $scaffolder;
    }

    /**
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
                    $member = Security::getCurrentUser();

                    // Check authentication
                    if (!$member) {
                        throw new Exception('Please log in first...');
                    }

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

                    $model->QuestionnaireData = $model->getQuestionsData($questionnaire);

                    $model->write();

                    return $model;
                }
            })
            ->end();
    }

    /**
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

                            // check if input field is email field and
                            // it is product owner email field
                            $productOwnerEmailField = QuestionnaireSubmission::is_email_field_prouct_owner_email_field(
                                $questionnaireSubmission->QuestionnaireData,
                                $args['QuestionID']
                            );

                            // if it is product owner email field, then add product owner member id
                            if (!empty($productOwnerEmailField)) {
                                // validate businessOwnerID, if field type is input
                                $businessOwnerID = QuestionnaireSubmission::validate_business_owner_email(
                                    $jsonDecodeAnswerData->inputs,
                                    $productOwnerEmailField,
                                    $questionnaireSubmission->User()->ID
                                );

                                $questionnaireSubmission->BusinessOwnerID = $businessOwnerID;
                            }
                        }

                        if ($jsonDecodeAnswerData->answerType == "action") {
                            //validate action field
                            QuestionnaireSubmission::validate_answer_action_data($jsonDecodeAnswerData->actions, $questionnaireSubmission->QuestionnaireData, $args['QuestionID']);
                        }
                    } while (false);

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
                    $questionnaireSubmission = QuestionnaireSubmission::validate_before_updating_questionnaire_submission($args['ID']);

                    $questionnaireSubmission->doesQuestionnairBelongToCurrentUser();

                    $questionnaireSubmission->QuestionnaireStatus = 'waiting_for_security_architect_approval';

                    if (!$questionnaireSubmission->SendEmailToSecurityArchitect) {
                        $members = $questionnaireSubmission->getApprovalMembersListByGroup('security-architect');

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

                    $questionnaireSubmission->updateQuestionnaireOnApproveAndDeny('approved');

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

                    $questionnaireSubmission->updateQuestionnaireOnApproveAndDeny('denied');

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
            $inputFields['IsProductOwner'] = $answerInputField->IsProductOwner;
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
    public function getSubmitterLink()
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
     * @param int $submissionID Questionnaire Submission ID
     *
     * @throws Exception
     * @return Dataobject
     */
    public static function validate_before_updating_questionnaire_submission($submissionID)
    {
        $member = Security::getCurrentUser();

        // Check authentication
        if (!$member) {
            throw new Exception('Please log in first.');
        }

        // Check submission ID
        if (empty($submissionID) || !is_numeric($submissionID)) {
            throw new Exception('Please enter a valid ID.');
        }

        // get QuestionnaireSubmission
        $questionnaireSubmission = QuestionnaireSubmission::get()->byID($submissionID);

        if (!$questionnaireSubmission) {
            throw new Exception('No data available for Questionnaire Submission. Please start again');
        }

        return $questionnaireSubmission;
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
     * update quesionnaire approver details based on group and permission
     *
     * @param string $status status approved/denied
     * @throws Exception
     * @return Void
     */
    public function updateQuestionnaireOnApproveAndDeny($status)
    {
        $member = Security::getCurrentUser();

        $accessDetail = $this->doesCurrentUserHasAccessToApproveDeny($member);

        if (!$accessDetail['hasAccess'] || !$accessDetail['group']) {
            throw new Exception($accessDetail['message']);
        }

        if ($accessDetail['group'] == 'security-architect') {
            $this->updateSecurityArchitectDetail($member, $status);

            if ($status == 'approved') {
                $this->QuestionnaireStatus = 'waiting_for_approval';

                // get CISO group and Business owner member list
                $members = $this->getApprovalMembersListByGroup('ciso');

                if (!$members) {
                    throw new Exception('Please add member in Security architect group.');
                }

                if (!$this->BusinessOwnerID) {
                    throw new Exception('Please add business owner.');
                }

                $members[] = $this->BusinessOwnerID;

                // send email to CISO group and Business owner
                $qs = QueuedJobService::create();

                $qs->queueJob(
                    new SendApprovalLinkEmailJob($this, $members),
                    date('Y-m-d H:i:s', time() + 90)
                );
            } else {
                // no email, internal communication between Submitter and security-architect
                $this->QuestionnaireStatus = 'in_progress';
            }

            $this->write();
        }

        if ($accessDetail['group'] == 'ciso') {
            $this->updateCisoDetail($member, $status);
            $this->write();
        }

        if ($accessDetail['group'] == 'business-owner') {
            $this->updateBusinessOwnerDetail($member, $status);
            if ($status == 'approved') {
                $this->QuestionnaireStatus = $status;

                // send denied email to the user (submitter)
                $queuedJobService = QueuedJobService::create();
                $queuedJobService->queueJob(
                    new SendApprovedNotificationEmailJob($this),
                    date('Y-m-d H:i:s', time() + 90)
                );
            } else {
                $this->QuestionnaireStatus = $status;

                // send denied email to the user (submitter)
                $queuedJobService = QueuedJobService::create();
                $queuedJobService->queueJob(
                    new SendDeniedNotificationEmailJob($this),
                    date('Y-m-d H:i:s', time() + 90)
                );
            }
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
    * @param DataObject $member member
    * @param string     $status status
    * @return void
    */
    public function updateBusinessOwnerDetail($member = null, $status = null)
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
        $group = 'security-architect';

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
        $group = 'ciso';

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
    * Check if current user has access for approval or deny
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

        // check for security architect
        if ($this->QuestionnaireStatus == 'waiting_for_security_architect_approval') {
            $accessdetails = $this->getSecurityArchitectAccessDetail($member);
            return $accessdetails;
        }

        // check for Business owner
        if ($this->QuestionnaireStatus == 'waiting_for_approval'
          && (int)$member->ID === (int)$this->BusinessOwnerID) {
            if ($this->BusinessOwnerApprovalStatus != "pending") {
                return [
                    "hasAccess" => false,
                    "message" => 'Sorry, this is already approved and denied by the Business Owner.',
                    "group" => 'business-owner'
                ];
            } else {
                return [
                    "hasAccess" => true,
                    "message" => 'Yes, current user has access to approve and deny.',
                    "group" => 'business-owner'
                ];
            }
        }

        // check for CISO
        if (in_array($this->QuestionnaireStatus, ['waiting_for_approval', 'pending', 'approved'])) {
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
     * @param string $questionnaireData questionnaire
     * @param int    $QuestionId        Question Id
     * @return mixed
     */
    public static function is_email_field_prouct_owner_email_field($questionnaireData, $QuestionId)
    {
        $questions = json_decode($questionnaireData);

        $emailField = null;

        foreach ($questions as $question) {
            if ($question->ID == $QuestionId) {
                foreach ($question->AnswerInputFields as $inputFields) {
                    if ($inputFields->InputType == 'email' &&
                        property_exists($inputFields, 'IsProductOwner') &&
                        $inputFields->IsProductOwner) {
                        $emailField = $inputFields;
                    }
                }
            }
        }

        return $emailField;
    }

    /**
     * @param array  $inputAnswers input field answer
     * @param object $emailField   email field
     * @param int    $submitterID  Submitter Id
     *
     * @throws Exception
     * @return int
     */
    public static function validate_business_owner_email($inputAnswers, $emailField, $submitterID)
    {
        foreach ($inputAnswers as $inputAnswer) {
            if ($emailField->ID == $inputAnswer->id) {
                if (empty($inputAnswer->data)) {
                    return 0;
                }

                $businessOwner = Member::get()->filter('Email', $inputAnswer->data)->first();

                if (!$businessOwner) {
                    throw new Exception(
                        sprintf(
                            'Sorry, we don\'t have any user with given email address:- %s.',
                            $inputAnswer->data
                        )
                    );
                }

                if ((int)$businessOwner->ID === (int)$submitterID) {
                    throw new Exception(
                        'Sorry, this is a submitter email address, please enter the business owner email address.'
                    );
                }

                return $businessOwner->ID;
            }
        }

        return 0;
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
        // get CISO group's member
        if ($group == 'ciso') {
            $group = Group::get()->filter('code', $group)->first();
            if ($group) {
                $members = $group->Members();
            }
        }

        // get Security Architect group's member
        if ($group == 'security-architect') {
            $group = Group::get()->filter('code', $group)->first();
            if ($group) {
                $members = $group->Members();
            }
        }

        if (!$members) {
            throw new Exception('Please add member for the CISO and Security Architect group.');
        }

        $membersArray = $members->toArray();

        $membersIdList = array_column($membersArray, 'ID');

        return $membersIdList;
    }
}
