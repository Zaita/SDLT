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

/**
 * Class Question
 *
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
            $inputFields['MultiChoiceSingleAnswerDefault'] = $answerInputField->GQMultiChoiceSingleAnswerDefault;
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
}
