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

use SilverStripe\Forms\FieldList;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\HasManyList;
use SilverStripe\Security\Member;
use SilverStripe\Security\Security;
use Symbiote\GridFieldExtensions\GridFieldOrderableRows;
use SilverStripe\Forms\GridField\GridFieldPaginator;
use SilverStripe\Forms\GridField\GridFieldAddExistingAutocompleter;
use NZTA\SDLT\Traits\SDLTModelPermissions;
use SilverStripe\ORM\DB;
use SilverStripe\ORM\ArrayList;
use SilverStripe\View\ArrayData;

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
     * @param DataObject $question question
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
            $inputFields['PlaceHolder'] = $answerInputField->PlaceHolder;
            $inputFields['IsBusinessOwner'] = $answerInputField->IsBusinessOwner;
            $inputFields['IsProductName'] = $answerInputField->IsProductName;
            $inputFields['IsBusinessOwnerName'] = $answerInputField->IsBusinessOwnerName;
            $inputFields['MultiChoiceAnswer'] = $answerInputField->GQLMultiChoiceAnswer;
            $inputFields['MultiChoiceSingleAnswerDefault'] = $answerInputField->MultiChoiceSingleAnswerDefault;
            $inputFields['MultiChoiceMultipleAnswerDefault'] = $answerInputField->GQLMultiChoiceMultipleAnswerDefault;
            $finalInputFields[] = $inputFields;
        }

        return $finalInputFields;
    }

    /**
     * @param DataObject $question question
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
            $actionFields['TaskID'] = $answerActionField->Task()->ID;
            $actionFieldData['Result'] = $answerActionField->Result;
            $actionFieldData['IsApprovalForTaskRequired'] = $answerActionField->IsApprovalForTaskRequired;
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
     *
     * @return string
     */
    public function getLink($action = 'edit')
    {
        if ($this->Questionnaire()->exists()) {
            return $this->Questionnaire()->getLink('ItemEditForm/field/Questions/item/'. $this->ID . '/' . $action);
        }
        else {
            return $this->Task()->getLink('ItemEditForm/field/Questions/item/'. $this->ID . '/' . $action);
        }
    }

    /**
     * getAssociateTaskList
     *
     * We must avoid making database queries as much as possible in this method
     * This is due to an n+1 database query that takes a long time to process
     * This method executes for every question in the Task::UsedOn tab
     * @return ArrayList
     */
    public function getAssociateTaskList($taskID = '')
    {
        $taskList = ArrayList::create();

        //no additional database queries here, we can just check the has_one ID
        //is not 0 (exists() costs one query)
        if (!$this->QuestionnaireID && !$this->TaskID) {
            return $taskList;
        }

        //by the time we reach this query, we've reduced it to questions known
        //to have answer action fields with a task associated.
        $actions = $this->AnswerActionFields();

        foreach ($actions as $action) {
            if (!$action->TaskID) {
                continue;
            }

            //avoid running a database query until we know there's a valid ID
            if(!empty($taskID) && (int)$action->TaskID !== (int)$taskID) {
                continue;
            }
            //since we have a valid ID and we know it's the task we want,
            //execute the SQL query to obtain the task
            $task = $action->Task();

            // questionnaire and task name
            // we need a database query here to get the questionnaire/task name
            $name = $this->QuestionnaireID ?
                $this->Questionnaire()->Name : $this->Task()->Name;

            $usedOn = $this->QuestionnaireID ?
                "Questionnaire's Question" : "Task's Question";

            $data['Name'] = $name;
            $data['Link'] = $this->Link;
            $data['TaskID'] = $task->ID;
            $data['Question'] = $this->Title;
            $data['UsedOn'] = $usedOn;

            $taskList->push(ArrayData::create($data));
        }

        return $taskList;
    }
}
