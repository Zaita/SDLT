<?php

/**
 * This file contains the "Question" class.
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
use SilverStripe\Forms\FieldList;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\HasManyList;
use SilverStripe\ORM\ArrayList;
use Symbiote\GridFieldExtensions\GridFieldOrderableRows;
use SilverStripe\Forms\GridField\GridFieldPaginator;
use SilverStripe\Forms\GridField\GridFieldAddExistingAutocompleter;
use NZTA\SDLT\Traits\SDLTModelPermissions;
use SilverStripe\ORM\DB;
use SilverStripe\Security\Security;

/**
 * Class Question
 */
class Question extends DataObject implements ScaffoldingProvider
{
    /**
     * @property string Title
     * @property string Question
     * @property string Description
     * @property string Type
     * @property Questionnaire Questionnaire
     *
     * @method HasManyList AnswerInputFields()
     * @method HasManyList AnswerActionFields()
     */
    use SDLTModelPermissions;
    /**
     * @var string
     */
    private static $table_name = 'Question';

    /**
     * @var array
     */
    private static $db = [
        'Title' => 'Varchar(255)',
        'Question' => 'Text',
        'Description' => 'Text',
        'AnswerFieldType' => 'Enum(array("input", "action"))',
        'SortOrder' => 'Int',
    ];

    /**
     * A question's answer can have fields type either inputs or actions, but not both
     *
     * @var array
     */
    private static $has_many = [
        'AnswerInputFields' => AnswerInputField::class,
        'AnswerActionFields' => AnswerActionField::class
    ];

    /**
     * @var array
     */
    private static $has_one = [
        'Questionnaire' => Questionnaire::class,
        'Task' => Task::class
    ];

    /**
     * @var array
     */
    private static $summary_fields = [
        'Title',
        'Question',
        'AnswerFieldType',
        'ShowActionResult' => 'Results',
    ];

    /**
     * @var array
     */
    private static $field_labels = [
        'Title' => 'Question Title',
        'Description' => 'Question Description',
        'Question' => 'Question Heading'
    ];

    /**
     * @var string
     */
    private static $default_sort = 'SortOrder';

    /**
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        $fields->removeByName(['QuestionnaireID', 'SortOrder', 'TaskID']);

        $answerInputFields = $fields->dataFieldByName('AnswerInputFields');

        if ($answerInputFields) {
            $inputGridconfig = $answerInputFields->getConfig();

            $inputGridconfig->addComponent(
                new GridFieldOrderableRows('SortOrder')
            );
            $inputGridconfig->removeComponentsByType(GridFieldAddExistingAutocompleter::class);

            $pageConfig = $inputGridconfig->getComponentByType(GridFieldPaginator::class);
            $pageConfig->setItemsPerPage(250);
        }

        $answerActionFields = $fields->dataFieldByName('AnswerActionFields');

        if ($answerActionFields) {
            $actionGridconfig = $answerActionFields->getConfig();

            $actionGridconfig->addComponent(
                new GridFieldOrderableRows('SortOrder')
            );
            $actionGridconfig->removeComponentsByType(GridFieldAddExistingAutocompleter::class);

            $pageConfig = $actionGridconfig->getComponentByType(GridFieldPaginator::class);
            $pageConfig->setItemsPerPage(250);
        }

        if ($this->AnswerFieldType === 'input') {
            $fields->removeByName('AnswerActionFields');
        }
        if ($this->AnswerFieldType === 'action') {
            $fields->removeByName('AnswerInputFields');
        }

        return $fields;
    }

    /**
     * Deal with pre-write processes.
     *
     * @return void
     */
    public function onBeforeWrite()
    {
        parent::onBeforeWrite();

        if (!$this->ID) {
            $maxSortOrder = DB::query("SELECT MAX(\"SortOrder\") FROM \"Question\"")->value();
            $this->SortOrder = $maxSortOrder + 1;
        }
    }

    /**
     * @param SchemaScaffolder $scaffolder Scaffolder
     * @return SchemaScaffolder
     */
    public function provideGraphQLScaffolding(SchemaScaffolder $scaffolder)
    {
        // Provide entity type
        $typeScaffolder = $scaffolder
            ->type(Question::class)
            ->addFields([
                'ID',
                'Title',
                'Question',
                'Description',
                'AnswerFieldType'
            ]);

        // Provide relations
        $typeScaffolder
            ->nestedQuery('AnswerInputFields')
            ->setUsePagination(false)
            ->end();
        $typeScaffolder
            ->nestedQuery('AnswerActionFields')
            ->setUsePagination(false)
            ->end();

        return $scaffolder;
    }

    /**
     * get details for Answer Input Fields
     *
     * @return array $finalInputFields
     */
    public function getAnswerInputFieldsData()
    {
        $finalInputFields = [];

        foreach ($this->AnswerInputFields() as $answerInputField) {
            $inputFields['ID'] = $answerInputField->ID;
            $inputFields['Label'] = $answerInputField->Label;
            $inputFields['InputType'] = $answerInputField->InputType;
            $inputFields['Required'] = $answerInputField->Required;
            $inputFields['MinLength'] = $answerInputField->MinLength;
            $inputFields['MaxLength'] = $answerInputField->MaxLength;
            $inputFields['PlaceHolder'] = $answerInputField->PlaceHolder;
            $inputFields['IsBusinessOwner'] = $answerInputField->IsBusinessOwner;
            $inputFields['IsProductName'] = $answerInputField->IsProductName;
            $inputFields['IsBusinessOwnerName'] = $answerInputField->IsBusinessOwnerName;
            $inputFields['MultiChoiceAnswer'] = $answerInputField->GQLMultiChoiceAnswer;
            $inputFields['MultiChoiceSingleAnswerDefault'] = $answerInputField->MultiChoiceSingleAnswerDefault;
            $inputFields['MultiChoiceMultipleAnswerDefault'] = $answerInputField->MultiChoiceMultipleAnswerDefault;
            $finalInputFields[] = $inputFields;
        }

        return $finalInputFields;
    }

    /**
     * get details for Answer Action Fields
     *
     * @return array $finalActionFields
     */
    public function getAnswerActionFieldsData()
    {
        $finalActionFields = [];

        foreach ($this->AnswerActionFields() as $answerActionField) {
            $actionFields['ID'] = $answerActionField->ID;
            $actionFields['Label'] = $answerActionField->Label;
            $actionFields['ActionType'] = $answerActionField->ActionType;
            $actionFields['Message'] = $answerActionField->Message;
            $actionFields['GotoID'] = $answerActionField->Goto()->ID;
            $actionFields['QuestionID'] = $answerActionField->Question()->ID;

            $taskIDs = $answerActionField->Tasks()->column('ID');
            $actionFields['TaskIDs'] = $taskIDs
                ? json_encode($taskIDs)
                : '';

            $actionFields['Result'] = $answerActionField->Result;
            $actionFields['IsApprovalForTaskRequired'] = $answerActionField->IsApprovalForTaskRequired;
            $finalActionFields[] = $actionFields;
        }

        return $finalActionFields;
    }

    /**
     * Show all potential AnswerAction.Result values in the summary field
     *
     * @return string
     */
    public function ShowActionResult()
    {
        $results = $this->AnswerActionFields()
            ->exclude('Result', null)
            ->map('ID', 'Result')
            ->toArray();

        return implode('; ', $results);
    }

    /**
     * get current object link in model admin
     * @param string $action action type
     * @return string
     */
    public function getLink($action = 'edit')
    {
        if ($this->QuestionnaireID) {
            return $this->Questionnaire()->getLink('ItemEditForm/field/Questions/item/'. $this->ID . '/' . $action);
        } elseif ($this->TaskID) {
            return $this->Task()->getLink('ItemEditForm/field/Questions/item/'. $this->ID . '/' . $action);
        }

        return '';
    }

    /**
     * create_task_submissions_according_to_answers
     *
     * @param string $questionData           Questions
     * @param string $answerData             Answers
     * @param int    $submissionID           Questionnaire submission id
     * @param string $questionnaireLevelTask Questinnaire level task
     * @param string $secureToken            When task is completed by vendor
     * @param string $type                   qs = Questinnaire Submission / ts =Task Submission
     * @return void
     */
    public static function create_task_submissions_according_to_answers($questionData, $answerData, $submissionID, $questionnaireLevelTask = '', $secureToken = '', $type = 'qs') : void
    {
        $member = Security::getCurrentUser();

        if (!$member && $secureToken && $type = 'ts') {
            $member = TaskSubmission::get_by_id($submissionID)->Submitter();
        }

        if (!$member) {
            throw new Exception('Member does not exist.');
        }

        $taskList = [];
        $answers = json_decode($answerData, true);
        $questions = json_decode($questionData, true);

        $isOldSubmission = false; // it will be true for has one relationshiop for old submission

        // question level task
        foreach ($questions as $question) {
            $questionID = $question['ID'];

            // task is generated by the action fields only
            // and traverse the actions fields of the question only if
            // question is applicable and has answer
            if (isset($question['AnswerFieldType']) &&
                $question['AnswerFieldType'] == "action" &&
                isset($question['AnswerActionFields']) &&
                count($question['AnswerActionFields']) &&
                isset($answers[$questionID]['isApplicable']) &&
                $answers[$questionID]['isApplicable'] &&
                isset($answers[$questionID]['hasAnswer']) &&
                $answers[$questionID]['hasAnswer'] &&
                isset($answers[$questionID]['answerType']) &&
                $answers[$questionID]['answerType'] == "action"
            ) {
                // traverse the question's actions field array
                foreach ($question['AnswerActionFields'] as $action) {
                    // filter if the action is chose
                    $filter = (string) $action['ID'];

                    if (!isset($answers[$questionID]['actions'])) {
                        continue;
                    }
                    $answerAction = array_filter ($answers[$questionID]['actions'], function($e) use ($filter) {
                        return $e['id'] === $filter && $e['isChose'];
                    });

                    // if action is chose and action has task, then
                    // include the tasks id in the $taskList array
                    // this is for many_many relationship
                    if (array_key_exists('TaskIDs', $action) && strlen($action['TaskIDs']) && count($answerAction)) {
                        $taskIDs = json_decode($action['TaskIDs']);
                        $taskList = array_merge($taskList, $taskIDs);
                    }

                    // this for has_one relationship for old questionnaire submission
                    if (array_key_exists('TaskID', $action) && $action['TaskID'] != 0 && count($answerAction)) {
                        $taskList = array_merge((array)$taskList, (array)$action['TaskID']);
                        $isOldSubmission = true;
                    }
                }
            }
        }

        // add the questionnaire level tasks id in the $taskList array
        if (strlen($questionnaireLevelTask)) {
            $taskIDs = json_decode($questionnaireLevelTask);
            $taskList = array_merge($taskList, $taskIDs);
        }

        // create task-submissions
        foreach (array_unique($taskList) as $taskID) {
            $taskSubmission = TaskSubmission::create_task_submission(
                $taskID,
                $submissionID,
                $member->ID,
                $isOldSubmission
            );
        }
    }

    /**
     * create question from json import
     *
     * @param object $questionJsonObj question json object
     * @return DataObject
     */
    public static function create_record_from_json($questionJsonObj)
    {
        $obj = self::create();

        $obj->Title = $questionJsonObj->title;
        $obj->Question = $questionJsonObj->question ?? '';
        $obj->Description = $questionJsonObj->description ?? '';
        $obj->AnswerFieldType = $questionJsonObj->answerFieldType ??  'input';

        // add answer input fields
        if (property_exists($questionJsonObj, "answerInputFields") &&
            !empty($answerInputFields = $questionJsonObj->answerInputFields)) {
            foreach ($answerInputFields as $inputField) {
                $newInputField = AnswerInputField::create_record_from_json($inputField);
                $obj->AnswerInputFields()->add($newInputField);
            }
        }

        if (property_exists($questionJsonObj, "answerActionFields") &&
            !empty($answerActionFields = $questionJsonObj->answerActionFields)) {
            foreach ($answerActionFields as $actionField) {
                $newActionField = AnswerActionField::create_record_from_json($actionField);
                $obj->AnswerActionFields()->add($newActionField);
            }
        }

        $obj->write();

        return $obj;
    }
}
