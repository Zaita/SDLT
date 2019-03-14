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
use SilverStripe\GraphQL\Scaffolding\Interfaces\ResolverInterface;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use SilverStripe\ORM\DataObject;
use SilverStripe\Security\Member;
use SilverStripe\Security\Security;
use SilverStripe\Security\SecurityToken;
use SilverStripe\ORM\HasManyList;
use SilverStripe\Control\Email\Email;
use Symbiote\QueuedJobs\Services\QueuedJobService;
use NZTA\SDLT\Job\SendSubmitterLinkEmailJob;
use Silverstripe\Control\Director;
use SilverStripe\Core\Convert;

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
        'QuestionnaireStatus' => 'Enum(array("in_progress", "pending", "approved", "denied"))',
        'CiscoApproval' => 'Enum(array("pending", "approved", "denied"))',
        'BussionOwnerApproval' => 'Enum(array("pending", "approved", "denied"))',
        'UUID' => 'Varchar(255)',
        'StartEmailSendStatus' => 'Boolean',
    ];

    /**
     * @var array
     */
    private static $has_one = [
        'User' => Member::class,
        'Questionnaire' => Questionnaire::class
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
        'CiscoApproval',
        'BussionOwnerApproval',
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
                'CiscoApproval',
                'BussionOwnerApproval',
                'QuestionnaireData',
                'AnswerData',
                'Questionnaire',
                'User',
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
                 * @param mixed $object
                 * @param array $args
                 * @param mixed $context
                 * @param ResolveInfo $info
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

                    // Filter data
                    // TODO: filter by status (only pending or in_progress)
                    $data = QuestionnaireSubmission::get()->where([
                        'UUID' => $uuid,
                        'UserID' => $member->ID
                    ]);

                    return $data;
                }
            })
            ->end();

        $this->createQuestionnaireSubmission($scaffolder);
        $this->updateQuestionnaireSubmission($scaffolder);

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
                 * @param mixed $object
                 * @param array $args
                 * @param mixed $context
                 * @param ResolveInfo $info
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
                    $model->CiscoApproval = 'pending';
                    $model->BussionOwnerApproval = 'pending';
                    $model->QuestionnaireID = $questionnaire->ID;
                    $model->UserID = $member->ID;
                    $model->StartEmailSendStatus = 0;

                    $model->UUID = uniqid();

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
                    new SendSubmitterLinkEmailJob($this),
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
                 * @param mixed $object
                 * @param array $args
                 * @param mixed $context
                 * @param ResolveInfo $info
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

                    // Check question ID
                    if (empty($args['QuestionID']) || !is_numeric($args['QuestionID'])) {
                        throw new Exception('Please enter a valid QuestionID.');
                    }

                    // Check answer data
                    if (empty($args['AnswerData']) || !is_string($args['AnswerData'])) {
                        throw new Exception('Please enter a valid AnswerData.');
                    }

                    $jsonDecodeAnswerData = json_decode($args['AnswerData']);

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
                        if((bool)($jsonDecodeAnswerData->hasAnswer) === false) {
                            break;
                        }
                        if((bool)($jsonDecodeAnswerData->isApplicable) === false) {
                            break;
                        }

                        if ($jsonDecodeAnswerData->answerType == "input") {
                            QuestionnaireSubmission::validate_answer_input_data($jsonDecodeAnswerData->inputs);
                        }

                        if ($jsonDecodeAnswerData->answerType == "action") {
                            QuestionnaireSubmission::validate_answer_action_data($jsonDecodeAnswerData->actions);
                        }
                    } while(false);

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
}
