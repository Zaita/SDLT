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
        'QuestionnaireStatus' => 'Enum(array("In-progress", "Pending", "Approved", "Denied"))',
        'CiscoApproval' => 'Enum(array("Pending", "Approved", "Denied"))',
        'BussionOwnerApproval' => 'Enum(array("Pending", "Approved", "Denied"))',
        'UUID' => 'Varchar(255)',
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
              'QuestionnaireData'
            ]);

        // Provide relations
        $sumissionScaffolder
            ->operation(SchemaScaffolder::READ)
            ->setName('readQuestionnaireSubmission')
            ->setUsePagination(false)
            ->end();

        $this->createQuestionnaireSubmission($scaffolder);

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

                $this->SubmitterName = $member->FirstName;
                $this->SubmitterRole = $member->UserRole;
                $this->SubmitterEmail = $member->Email;

                $this->QuestionnaireStatus = 'In-progress';
                $this->CiscoApproval = 'Pending';
                $this->BussionOwnerApproval = 'Pending';
                $this->QuestionnaireID = $questionnaire->ID;
                $this->UserID = $member->ID;

                $this->UUID = uniqid();

                $this->QuestionnaireData = $this->getQuestionsData($questionnaire);

                return $this;
            })
            ->end();

        $this->write();
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
}
