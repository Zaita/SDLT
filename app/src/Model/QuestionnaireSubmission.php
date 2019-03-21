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
        'QuestionnaireStatus' => 'Enum(array("in_progress", "submitted", "waiting_for_appraval", "approved", "denied"))',
        'UUID' => 'Varchar(36)',
        'StartEmailSendStatus' => 'Boolean',
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
                'SendApprovedNotificatonToSecurityArchitect'
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
                        throw new Exception('Wrong argument');
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
        $this->updateQuestionnaireStatusToWaitingForApproval($scaffolder);
        $this->updateQuestionnaireStatusToSubmitted($scaffolder);
        $this->updateQuestionnaireStatusToApproved($scaffolder);
        $this->updateQuestionnaireStatusToDenied($scaffolder);
        $this->getUserPermissionToApproveDeny($scaffolder);

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

                    // Is CisoApprovalRequired for the questionnaire
                    $model->CisoApprovalStatus = 'pending';

                    if (!$questionnaire->IsCisoApprovalRequired) {
                        $model->CisoApprovalStatus = 'not_applicable';
                    }

                    $model->BusinessOwnerApprovalStatus = 'pending';

                    // Is BusinessOwnerApprovalRequired for the questionnaire
                    if (!$questionnaire->IsBusinessOwnerApprovalRequired) {
                        $model->BusinessOwnerApprovalStatus = 'not_applicable';
                    }

                    $model->SecurityArchitectApprovalStatus = 'pending';

                    // Is SecurityArchitectApprovalRequired
                    if (!$questionnaire->IsSecurityArchitectApprovalRequired) {
                        $model->SecurityArchitectApprovalStatus = 'not_applicable';
                    }

                    $model->QuestionnaireID = $questionnaire->ID;

                    $model->UserID = $member->ID;
                    $model->StartEmailSendStatus = 0;
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
                    $member = Security::getCurrentUser();
                    $businessOwnerID = 0;

                    // Check authentication
                    if (!$member) {
                        throw new Exception('Please log in first.');
                    }

                    // Check submission ID
                    if (empty($args['ID']) || !is_numeric($args['ID'])) {
                        throw new Exception('Please enter a valid ID.');
                    }

                    // Check question ID
                    if (empty($args['QuestionID']) || !is_numeric($args['QuestionID'])) {
                        throw new Exception('Please enter a valid QuestionID.');
                    }

                    // Check answer data
                    if (empty($args['AnswerData']) || !is_string($args['AnswerData'])) {
                        throw new Exception('Please enter a valid AnswerData.');
                    }

                    // AnswerData is generated by `window.btoa(JSON.stringify(answerData))` in JavaScript
                    // This is to avoid parsing issue caused by `quote`, `\n` and other special characters
                    $jsonDecodeAnswerData = json_decode(base64_decode($args['AnswerData']));

                    if (is_null($jsonDecodeAnswerData)) {
                        throw new Exception('data is not a vaild json object.');
                    }

                    // get QuestionnaireSubmission
                    $questionnaireSubmission = QuestionnaireSubmission::get()->byID($args['ID']);

                    if (!$questionnaireSubmission) {
                        throw new Exception('No data available for Questionnaire Submission. Please start again');
                    }

                    if ((int)($member->ID) !== (int)($questionnaireSubmission->UserID)) {
                        throw new Exception('Sorry Questionnaire Submission does not belong to login user.');
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
                            QuestionnaireSubmission::validate_answer_input_data($jsonDecodeAnswerData->inputs);

                            // validate businessOwnerID, if field type is input
                            $businessOwnerID = QuestionnaireSubmission::validate_business_owner_email(
                                $jsonDecodeAnswerData->inputs,
                                $questionnaireSubmission->QuestionnaireData,
                                $args['QuestionID']
                            );
                        }

                        if ($jsonDecodeAnswerData->answerType == "action") {
                            QuestionnaireSubmission::validate_answer_action_data($jsonDecodeAnswerData->actions);
                        }
                    } while (false);

                    $answerDataArr = [];

                    if (!empty($questionnaireSubmission->AnswerData)) {
                        $answerDataArr = json_decode($questionnaireSubmission->AnswerData, true);
                    }

                    $answerDataArr[$args['QuestionID']] = $jsonDecodeAnswerData;

                    $data = json_encode($answerDataArr);

                    $questionnaireSubmission->AnswerData = $data;
                    $questionnaireSubmission->BusinessOwnerID = $businessOwnerID;

                    $questionnaireSubmission->write();

                    return $questionnaireSubmission;
                }
            })
            ->end();
    }

    /**
     * @param array  $inputAnswers      input field answer
     * @param string $questionnaireData questionnaire
     * @param array  $QuestionId        Question Id
     * @throws Exception
     * @return int
     */
    public static function validate_business_owner_email($inputAnswers, $questionnaireData, $QuestionId)
    {
        $questionnaireData = json_decode($questionnaireData);

        $emailField = null;

        foreach ($questionnaireData as $question) {
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

        if (!$emailField) {
            return 0;
        }

        foreach ($inputAnswers as $inputAnswer) {
            if ($emailField->ID == $inputAnswer->id) {
                if (empty($inputAnswer->data)) {
                    return 0;
                }

                $member = Member::get()->filter('Email', $inputAnswer->data)->first();

                if (!$member) {
                    throw new Exception(
                        sprintf(
                            'Sorry, we don\'t have any user with given email address:- %s.',
                            $inputAnswer->data
                        )
                    );
                }

                return $member->ID;
            }
        }


        return 0;
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
                    $member = Security::getCurrentUser();

                    // Check authentication
                    if (!$member) {
                        throw new Exception('Please log in first.');
                    }

                    // Check submission ID
                    if (empty($args['ID']) || !is_numeric($args['ID'])) {
                        throw new Exception('Please enter a valid ID.');
                    }

                    // get QuestionnaireSubmission
                    $questionnaireSubmission = QuestionnaireSubmission::get()->byID($args['ID']);

                    if (!$questionnaireSubmission) {
                        throw new Exception('No data available for Questionnaire Submission. Please start again');
                    }

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
    public function updateQuestionnaireStatusToWaitingForApproval(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('updateQuestionnaireStatusToWaitingForApproval', QuestionnaireSubmission::class)
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
                    $member = Security::getCurrentUser();

                    // Check authentication
                    if (!$member) {
                        throw new Exception('Please log in first.');
                    }

                    // Check submission ID
                    if (empty($args['ID']) || !is_numeric($args['ID'])) {
                        throw new Exception('Please enter a valid ID.');
                    }
                    // get QuestionnaireSubmission
                    $questionnaireSubmission = QuestionnaireSubmission::get()->byID($args['ID']);

                    if (!$questionnaireSubmission) {
                        throw new Exception('No data available for Questionnaire Submission. Please start again');
                    }

                    if ((int)($member->ID) !== (int)($questionnaireSubmission->UserID)) {
                        throw new Exception('Sorry Questionnaire Submission does not belong to login user.');
                    }

                    $questionnaireSubmission->QuestionnaireStatus = 'waiting_for_appraval';

                    $questionnaireSubmission->write();

                    // Send Email for Approval
                    $qs = QueuedJobService::create();
                    $qs->queueJob(
                        new SendApprovalLinkEmailJob($questionnaireSubmission),
                        date('Y-m-d H:i:s', time() + 90)
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
                    $member = Security::getCurrentUser();

                    // Check authentication
                    if (!$member) {
                        throw new Exception('Please log in first.');
                    }

                    // Check submission ID
                    if (empty($args['ID']) || !is_numeric($args['ID'])) {
                        throw new Exception('Please enter a valid Questionnaire Submission ID.');
                    }

                    // get QuestionnaireSubmission
                    $questionnaireSubmission = QuestionnaireSubmission::get()->byID($args['ID']);

                    if (!$questionnaireSubmission) {
                        throw new Exception('No data available for Questionnaire Submission. Please start again');
                    }

                    $questionnaireSubmission->updateQuestionnaireApproveDenyUserDetails($member, 'approved');

                    $isApproved = $questionnaireSubmission->isQuestionnaireApproved();

                    if ($isApproved) {
                        $questionnaireSubmission->QuestionnaireStatus = 'approved';
                        $qs = QueuedJobService::create();
                        $qs->queueJob(
                            new SendApprovedNotificationEmailJob($questionnaireSubmission),
                            date('Y-m-d H:i:s', time() + 90)
                        );
                    }

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
                    $member = Security::getCurrentUser();

                    // Check authentication
                    if (!$member) {
                        throw new Exception('Please log in first.');
                    }

                    // Check submission ID
                    if (empty($args['ID']) || !is_numeric($args['ID'])) {
                        throw new Exception('Please enter a valid Questionnaire Submission ID.');
                    }

                    // get QuestionnaireSubmission
                    $questionnaireSubmission = QuestionnaireSubmission::get()->byID($args['ID']);

                    if (!$questionnaireSubmission) {
                        throw new Exception('No data available for Questionnaire Submission. Please start again');
                    }

                    $questionnaireSubmission->updateQuestionnaireApproveDenyUserDetails($member, 'denied');

                    $questionnaireSubmission->QuestionnaireStatus = 'denied';
                    $questionnaireSubmission->write();

                    // send email to the user (submitter)
                    $queuedJobService = QueuedJobService::create();
                    $queuedJobService->queueJob(
                        new SendDeniedNotificationEmailJob($questionnaireSubmission),
                        date('Y-m-d H:i:s', time() + 90)
                    );

                    return $questionnaireSubmission;
                }
            })
            ->end();
    }

    /**
     * update quesionnaire approver details based on group and permission
     *
     * @param DataObject $member member
     * @param string     $status status approved/denied
     * @throws Exception
     * @return Void
     */
    public function updateQuestionnaireApproveDenyUserDetails($member, $status)
    {
        $accessDetail = $this->isCurrentUserHasAccessToApproveDeny();

        $accessDetailObj = json_decode($accessDetail);

        if (!$accessDetailObj->hasAccess) {
            throw new Exception($accessDetailObj->message);
        }

        if ($accessDetailObj->hasAccess) {
            $group = $accessDetailObj->group;

            if ($group == 'security-architect') {
                $this->updateSecurityArchitectDetail($member, $status);
            }

            if ($group == 'ciso') {
                $this->updateCisoDetail($member, $status);
            }

            if ($group == 'business-owner') {
                $this->updateBusinessOwnerDetail($member, $status);
            }
        }
    }

    /**
     * for quesionnaire submission, it required to be approved by every group,
     * if their approval is required(CISO Group, Security Architect Group, Business owner),
     * then only we can change questionnaire submission status
     *
     * @return boolean
     */
    public function isQuestionnaireApproved()
    {
        // approve status of ciso
        $cisoApproveStatus = 0;
        if ($this->CisoApprovalStatus == 'not_applicable'
            || $this->CisoApprovalStatus == "approved") {
            $cisoApproveStatus = 1;
        }

        // approve status of ciso
        $securityArchitectApproveStatus = 0;
        if ($this->SecurityArchitectApprovalStatus == 'not_applicable'
            || $this->SecurityArchitectApprovalStatus == "approved") {
            $securityArchitectApproveStatus = 1;
        }

        // approve status of ciso
        $businessOwnerApproveStatus = 0;
        if ($this->BusinessOwnerApprovalStatus == 'not_applicable'
            || $this->BusinessOwnerApprovalStatus == "approved") {
            $businessOwnerApproveStatus = 1;
        }

        if ($cisoApproveStatus && $securityArchitectApproveStatus
            && $businessOwnerApproveStatus) {
            return true;
        }

        return false;
    }

    /**
    * update approver details for group security-architect
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

        $this->write();
    }

    /**
    * update approver details for a business-owner
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

        $this->write();
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

        $this->write();
    }

    /**
     * check if current user has access to approve or deny the Questionnaire
     *
     * @throws Exception
     * @return object
     */
    public function isCurrentUserHasAccessToApproveDeny()
    {
        $approvalGroup = ['business-owner', 'ciso', 'security-architect'];

        $member = Security::getCurrentUser();

        // is user exist in approval member list
        $memberList = $this->getApprovalMemerIDList();

        $logInUserApprovalGroup = $this->getCurrentLoginUserGroup($member);

        // check Current user in the approval group
        if (!$logInUserApprovalGroup || !in_array($logInUserApprovalGroup, $approvalGroup)) {
            return json_encode([
                "hasAccess" => false,
                "group" => $logInUserApprovalGroup,
                "message" => 'Sorry, log in user does not belong to approval group.'
            ]);
        }

        if (!in_array($member->ID, $memberList)) {
            return json_encode([
                "hasAccess" => false,
                "group" => $logInUserApprovalGroup,
                "message" => 'Sorry current user don\'t has access to apparove/deny.'
            ]);
        }

        // check current user group has permission to approve/deny or
        // if QuestionnaireSubmission is already approved/denied by other Member
        // of the group
        switch ($logInUserApprovalGroup) {
            case 'business-owner':
                if ($this->BusinessOwnerApprovalStatus == 'not_applicable') {
                    return json_encode([
                        "hasAccess" => false,
                        "group" => $logInUserApprovalGroup,
                        "message" => 'Sorry business owner approval is not required,'
                    ]);
                }
                if ($this->BusinessOwnerApprovalStatus == 'approved'
                    || $this->BusinessOwnerApprovalStatus == 'denied') {
                    return json_encode([
                        "hasAccess" => false,
                        "group" => $logInUserApprovalGroup,
                        "message" => 'Sorry, this is already approved or denied by business owner.'
                    ]);
                }
                if ($this->BusinessOwnerApprovalStatus == 'pending') {
                    return json_encode([
                        "hasAccess" => true,
                        "group" => $logInUserApprovalGroup,
                        "message" => 'Approval pending from Business Owner'
                    ]);
                }
                break;
            case 'ciso':
                if ($this->CisoApprovalStatus == 'not_applicable') {
                    return json_encode([
                        "hasAccess" => false,
                        "group" => $logInUserApprovalGroup,
                        "message" => 'Sorry ciso group approval is not required.'
                    ]);
                }
                if ($this->CisoApprovalStatus == 'approved'
                    || $this->CisoApprovalStatus == 'denied') {
                    return json_encode([
                        "hasAccess" => false,
                        "group" => $logInUserApprovalGroup,
                        "message" => 'Sorry, this is already approved or denied by other group member.'
                    ]);
                }
                if ($this->CisoApprovalStatus == 'pending') {
                    return json_encode([
                        "hasAccess" => true,
                        "group" => $logInUserApprovalGroup,
                        "message" => 'CISO approval is pending.'
                    ]);
                }
                break;
            case 'security-architect':
                if ($this->SecurityArchitectApprovalStatus == 'not_applicable') {
                    return json_encode([
                        "hasAccess" => false,
                        "group" => $logInUserApprovalGroup,
                        "message" => 'Sorry security architect approval is not required.'
                    ]);
                }
                if ($this->SecurityArchitectApprovalStatus == 'approved'
                    || $this->CisoApprovalStatus == 'denied') {
                    return json_encode([
                        "hasAccess" => false,
                        "group" => $logInUserApprovalGroup,
                        "message" => 'Sorry, this is already approved or denied by other group member.'
                    ]);
                }
                if ($this->SecurityArchitectApprovalStatus == 'pending') {
                      return json_encode([
                          "hasAccess" => true,
                          "group" => $logInUserApprovalGroup,
                          "message" => 'CISO approval is pending.'
                      ]);
                }
                break;
            default:
                return json_encode([
                    "hasAccess" => false,
                    "group" => $logInUserApprovalGroup,
                    "message" => 'sorry, log in user does not belongs to approval group.'
                ]);
        }
    }

    /**
     * get Current login user groups
     *
     * @param DataObject $member member
     *
     * @return string
     */
    public function getCurrentLoginUserGroup($member)
    {
        // get current member group
        $logInUserApprovalGroup = '';

        // check if current user is business owner or
        // else calculate user group
        if ($this->isBusinessOwner()) {
            $logInUserApprovalGroup = 'business-owner';
        } else if ($member->Groups()->count() == 1) {
            $logInUserApprovalGroup = $member->Groups()->first()->Code;
        } else if ($member->Groups()->count() > 1) {
            $groups = $member->Groups();

            foreach ($groups as $group) {
                if ($group->Code == 'ciso' &&
                    $this->CisoApprovalStatus !== 'not_applicable') {
                      $logInUserApprovalGroup = $group->Code;
                }

                if ($group->Code == 'security-architect' &&
                    $this->SecurityArchitectApprovalStatus !== 'not_applicable') {
                      $logInUserApprovalGroup = $group->Code;
                }
            }

            if (empty($logInUserApprovalGroup)) {
                $logInUserApprovalGroup = $member->Groups()->first()->Code;
            }
        }

        return $logInUserApprovalGroup;
    }


    /**
     * @param SchemaScaffolder $scaffolder SchemaScaffolder
     *
     * @return void
     */
    public function getUserPermissionToApproveDeny(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->mutation('getUserPermissionToApproveDeny', QuestionnaireSubmission::class)
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
                    $member = Security::getCurrentUser();

                    // Check authentication
                    if (!$member) {
                        throw new Exception('Please log in first.');
                    }

                    // Check submission ID
                    if (empty($args['ID']) || !is_numeric($args['ID'])) {
                        throw new Exception('Please enter a valid Questionnaire Submission ID.');
                    }

                    // get QuestionnaireSubmission
                    $questionnaireSubmission = QuestionnaireSubmission::get()->byID($args['ID']);

                    if (!$questionnaireSubmission) {
                        throw new Exception('No data available for Questionnaire Submission. Please start again');
                    }

                    $accessDetailsObj = $questionnaireSubmission->isCurrentUserHasAccessToApproveDeny();

                    return $accessDetailsObj;
                }
            })
            ->end();
    }

    /**
    * @param array $actionFields actionFields
    * @throws Exception
    * @return void
    */
    public static function validate_answer_action_data($actionFields)
    {
        foreach ($actionFields as $actionField) {
            $actionFieldArr = get_object_vars($actionField);

            $actionFieldDetails = AnswerActionField::get()->byID($actionFieldArr['id']);

            if (!$actionFieldDetails) {
                throw new Exception(
                    sprintf(
                        'Sorry, no data available for action field ID: %d',
                        $actionFieldArr['id']
                    )
                );
            }

            if (!is_bool($actionFieldArr['isChose'])) {
                throw new Exception(
                    sprintf(
                        'Sorry, answer type should be boolean for action field ID: %d',
                        $actionFieldArr['id']
                    )
                );
            }
        }
    }

    /**
     * @param array $inputfields inputfields
     * @throws Exception
     * @return void
     */
    public static function validate_answer_input_data($inputfields)
    {
        foreach ($inputfields as $inputfield) {
            $inputfieldArr = get_object_vars($inputfield);

            $inputfieldDetails = AnswerInputField::get()->byID($inputfieldArr['id']);

            if (!$inputfieldDetails) {
                throw new Exception(
                    sprintf(
                        'Sorry, no data available for input field ID: %d',
                        $inputfieldArr['id']
                    )
                );
            }

            self::validate_input_field($inputfieldArr['data'], $inputfieldDetails);

            if ($inputfieldDetails->InputType == 'email') {
                self::validate_email_field($inputfieldArr['data'], $inputfieldDetails);
            }

            if ($inputfieldDetails->InputType == 'date') {
                self::validate_date_field($inputfieldArr['data'], $inputfieldDetails);
            }
        }
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
                    '%s is required',
                    $inputfieldDetails->Label
                )
            );
        }

        // validate minimum length
        if ($inputfieldDetails->MinLength > 0 &&
            strlen($data) < $inputfieldDetails->MinLength) {
            throw new Exception(
                sprintf(
                    '%s should be greater than %d.',
                    $inputfieldDetails->Label,
                    $inputfieldDetails->MinLength
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
     * @return array
     */
    public function getApprovalMemerIDList()
    {
        $memberList = [];

        // get CISO group's member
        if ($this->CisoApprovalStatus !== 'not_applicable') {
            $group = Group::get()->filter('code', 'ciso')->first();
            if ($group) {
                $members = $group->Members();
                foreach ($members as $member) {
                    $memberList[] = $member->ID;
                }
            }
        }

        // get Security Architect group's member
        if ($this->SecurityArchitectApprovalStatus !== 'not_applicable') {
            $group = Group::get()->filter('code', 'security-architect')->first();
            if ($group) {
                $members = $group->Members();
                foreach ($members as $member) {
                    $memberList[] = $member->ID;
                }
            }
        }

        // businessOwner
        if ($this->BusinessOwnerID) {
            $member = Member::get()->byID($this->BusinessOwnerID);
            if ($member) {
                $memberList[] =  $member->ID;
            }
        }

        return array_unique($memberList);
    }

    /**
     * @return boolean
     */
    public function isBusinessOwner()
    {
        $member = Security::getCurrentUser();

        if ($this->BusinessOwnerID && (int)$member->ID === (int)$this->BusinessOwnerID) {
            return true;
        }

        return false;
    }

    /**
     * @param string $group group
     * @throws Exception
     * @return DataObject
     */
    public function getApproverDetails($group = null)
    {
        if (empty($group)) {
            throw new Exception('Please enter a valid user group and role.');
        }

        if ($this->$group == 'ciso') {
            return $this->CisoApprover();
        }

        if ($this->$group == 'security-architect') {
            return $this->SecurityArchitectApprover();
        }

        if ($this->$group == 'business-owner') {
            return $this->BusinessOwner();
        }
    }
}
