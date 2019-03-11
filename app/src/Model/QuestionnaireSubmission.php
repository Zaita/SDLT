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

use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use GraphQL\Type\Definition\ResolveInfo;
use SilverStripe\GraphQL\MutationCreator;
use SilverStripe\GraphQL\OperationResolver;
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
use Exception;

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
        'QuestionnaireStatus' => 'Enum(array("In-progress", "Pending", "Approved", "Denied"))',
        'CiscoApproval' => 'Enum(array("Pending", "Approved", "Denied"))',
        'BussionOwnerApproval' => 'Enum(array("Pending", "Approved", "Denied"))',
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
     * @param SchemaScaffolder $scaffolder Scaffolder
     * @return SchemaScaffolder
     */
    public function provideGraphQLScaffolding(SchemaScaffolder $scaffolder)
    {
        // Provide entity type
        $sumissionScaffolder = $scaffolder
            ->type(QuestionnaireSubmission::class)
            ->addFields([
              'ID',
              'UUID',
              'QuestionnaireID',
              'UserID',
              'SubmitterName',
              'SubmitterRole',
              'SubmitterEmail',
              'QuestionnaireStatus',
              'CiscoApproval',
              'BussionOwnerApproval',
              'QuestionnaireData',
              'AnswerData'
            ]);

        // Provide relations
        $sumissionScaffolder
            ->operation(SchemaScaffolder::READ)
            ->setName('readQuestionnaireSubmission')
            ->setUsePagination(false)
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
            ->setResolver(function ($object, array $args, $context, ResolveInfo $info) {
                $member = Security::getCurrentUser();

                // Check authentication
                if (!$member) {
                    throw new Exception('Please log in first...');
                }

                $questionnaire = Questionnaire::get()->byID($args['QuestionnaireID']);

                // Check Questionnaire
                if (!$questionnaire) {
                    throw new Exception('Please select correct Questionnaire.');
                }

                // Check Questionnaire's questions
                if (!$questionnaire->Questions()->count()) {
                    throw new Exception('Sorry, no question available for selected Questionnaire.');
                }

                $model = self::create();

                $model->SubmitterName = $member->FirstName;
                $model->SubmitterRole = $member->UserRole;
                $model->SubmitterEmail = $member->Email;

                $model->QuestionnaireStatus = 'In-progress';
                $model->CiscoApproval = 'Pending';
                $model->BussionOwnerApproval = 'Pending';
                $model->QuestionnaireID = $questionnaire->ID;
                $model->UserID = $member->ID;

                $model->UUID = uniqid();

                $model->QuestionnaireData = $model->getQuestionsData($questionnaire);

                $model->write();

                return $model;
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

        if (!$this->startEmailSendStatus) {
            singleton(QueuedJobService::class)
                ->queueJob(
                    new SendSubmitterLinkEmailJob($this),
                    date('Y-m-d H:i:s', time() + 90)
                );

            $this->startEmailSendStatus = 1;

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
            $inputFields['ID'] = $answerInputField->Label;
            $inputFields['Label'] = $answerInputField->Label;
            $inputFields['InputType'] = $answerInputField->InputType;
            $inputFields['Required'] = $answerInputField->Required;
            $inputFields['MinLength'] = $answerInputField->MinLength;
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
            $actionFields['ID'] = $answerActionField->Label;
            $actionFields['Label'] = $answerActionField->Label;
            $actionFields['ActionType'] = $answerActionField->ActionType;
            $actionFields['Message'] = $answerActionField->Required;
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
        $link = Convert::html2raw(Director::absoluteBaseURL(). '#/' . $this->UUID);
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
            ->setResolver(function ($object, array $args, $context, ResolveInfo $info) {
                $member = Security::getCurrentUser();

                // Check authentication
                if (!$member) {
                    throw new Exception('Please log in first...');
                }

                $questionnaireSubmission = QuestionnaireSubmission::get()
                    ->byID($args['ID']);

                $answerDataArr = [];

                $jsonDecodeAnswerData = json_decode($args['AnswerData'], true);

                if (!empty($questionnaireSubmission->AnswerData)) {
                    $answerDataArr = json_decode($questionnaireSubmission->AnswerData, true);
                }

                $answerDataArr[$args['QuestionID']] = $args['AnswerData'];

                $data = json_encode($answerDataArr);

                $questionnaireSubmission->AnswerData = $data;

                $questionnaireSubmission->write();

                return $questionnaireSubmission;
            })
            ->end();
    }
}
