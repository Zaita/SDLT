<?php

/**
 * This file contains the "Question" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T.
 * @copyright 2019 New Zealand Transport Agency
 * @license https://nzta.govt.nz (BSD-3)
 * @link https://nzta.govt.nz
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

/**
 * Class Question
 *
 * @property string Title
 * @property string Question
 * @property string Description
 * @property string Type
 *
 * @property Questionnaire Questionnaire
 *
 * @method HasManyList AnswerInputFields()
 * @method HasManyList AnswerActionFields()
 */
class Question extends DataObject implements ScaffoldingProvider
{
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
     *
     * @return array
     */
    public function getAnswerInputFieldsData()
    {
        $inputFieldsData = [];

        foreach ($this->AnswerInputFields() as $answerInputField) {
            $inputFieldData['ID'] = $answerInputField->ID;
            $inputFieldData['Label'] = $answerInputField->Label;
            $inputFieldData['InputType'] = $answerInputField->InputType;
            $inputFieldData['Required'] = $answerInputField->Required;
            $inputFieldData['MinLength'] = $answerInputField->MinLength;
            $inputFieldData['PlaceHolder'] = $answerInputField->PlaceHolder;
            $inputFieldData['IsProductOwner'] = $answerInputField->IsProductOwner;
            $inputFieldsData[] = $inputFieldData;
        }

        return $inputFieldsData;
    }

    /**
     *
     * @return array
     */
    public function getAnswerActionFieldsData()
    {
        $actionFieldsData = [];

        foreach ($this->AnswerActionFields() as $answerActionField) {
            $actionFieldData['ID'] = $answerActionField->ID;
            $actionFieldData['Label'] = $answerActionField->Label;
            $actionFieldData['ActionType'] = $answerActionField->ActionType;
            $actionFieldData['Message'] = $answerActionField->Message;
            $actionFieldData['GotoID'] = $answerActionField->GotoID;
            $actionFieldData['QuestionID'] = $answerActionField->QuestionID;
            $actionFieldData['TaskID'] = $answerActionField->TaskID;
            $actionFieldData['Result'] = $answerActionField->Result;
            $actionFieldsData[] = $actionFieldData;
        }

        return $actionFieldsData;
    }

    /**
     * Show all potential AnswerAction.Result values in the summary field
     *
     * @return string
     */
    public function ShowActionResult()
    {
        $results = $this->AnswerActionFields()->map('ID', 'Result')->toArray();
        return implode('; ', $results);
    }
}
