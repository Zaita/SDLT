<?php

/**
 * This file contains the "AnswerInputField" class.
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
use SilverStripe\ORM\DataObject;
use SilverStripe\Security\Member;
use SilverStripe\Security\Security;
use NZTA\SDLT\Traits\SDLTModelPermissions;
use SilverStripe\Forms\TextField;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\DropdownField;
use SilverStripe\ORM\ValidationResult;
use Symbiote\MultiValueField\ORM\FieldType\MultiValueField;
use Symbiote\MultiValueField\Fields\KeyValueField;
use Symbiote\MultiValueField\Fields\MultiValueListField;
use UncleCheese\DisplayLogic\Forms\Wrapper;
use Exception;
use SilverStripe\Forms\LiteralField;

/**
 * Class AnswerInputField
 *
 * @property string Name
 * @property string Type
 *
 * @property Question Question
 */
class AnswerInputField extends DataObject implements ScaffoldingProvider
{
    use SDLTModelPermissions;
    /**
     * @var string
     */
    private static $table_name = 'AnswerInputField';

    /**
     * @var array
     */
    private static $db = [
        'Label' => 'Varchar(255)',
        'InputType' => 'Enum("text, email, textarea, date, url, multiple-choice: single selection, multiple-choice: multiple selection", "text")',
        'Required' => 'Boolean',
        'MinLength' => 'Int',
        'PlaceHolder' => 'Varchar(255)',
        'SortOrder' => 'Int',
        'IsBusinessOwner' => 'Boolean',
        'IsProductName' => 'Boolean',
        'IsBusinessOwnerName' => 'Boolean',
        'MultiChoiceAnswer' => MultiValueField::class,
        'MultiChoiceSingleAnswerDefault' => 'Varchar(255)',
        'MultiChoiceMultipleAnswerDefault' => MultiValueField::class,
    ];

    /**
     * @var string
     */
    private static $default_sort = 'SortOrder';

    /**
     * @var array
     */
    private static $has_one = [
        'Question' => Question::class
    ];

    /**
     * @var array
     */
    private static $summary_fields = [
        'Label',
        'InputType'
    ];

    /**
     * @var array
     */
    private static $field_labels = [
        'Label' => 'Field Label',
        'InputType' => 'Field Type'
    ];

    /**
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        $fields->removeByName([
            'QuestionID',
            'SortOrder',
            'MultiChoiceAnswer',
            'MultiChoiceSingleAnswerDefault',
            'MultiChoiceMultipleAnswerDefault',
        ]);

        $multiChoiceAnswerValues = $this->dbObject('MultiChoiceAnswer')
            ->getValues();

        // Manage multi-value selections
        $fields->addFieldsToTab(
            'Root.Main',
            Wrapper::create(FieldList::create([
                DropdownField::create(
                    'MultiChoiceSingleAnswerDefault',
                    'Radio Button Default Selection',
                    $multiChoiceAnswerValues ?: []
                )
                    ->setEmptyString('(none)')
                    ->setDescription(''
                        . "This selection represents which of the related "
                        . "questions is selected by default. Once values have "
                        . "been added, a default can be chosen."
                    )
                    ->setDisabled(!$multiChoiceAnswerValues)
                    ->setAttribute('style', 'width: 200px;')
                    ->hideIf('InputType')
                    ->startsWith('multiple-choice: multiple')
                    ->end(),
                Wrapper::create(MultiValueListField::create(
                    'MultiChoiceMultipleAnswerDefault',
                    'Checkbox Default Selections',
                    $multiChoiceAnswerValues ?: []
                )
                    ->setDisabled(!$multiChoiceAnswerValues)
                    ->setDescription(''
                        . 'These selections represent which of the related '
                        . 'question\'s checkboxes are checked by default. '
                        . 'Once values have been added, defaults can be chosen'
                    )
                )
                    ->hideUnless('InputType')
                    ->startsWith('multiple-choice: multiple')
                    ->end(),
                KeyValueField::create(
                    'MultiChoiceAnswer',
                    'Multiple Choice Answers'
                )
                ->setDescription(
                    'Each row represents a value (left) and label (right) for a'
                    . ' single '
                    . sprintf(' %s.', $this->multiSelectionFieldName())
                    . ' The value can be a maximum of 255 characters.'
                    . ' Default selections can be specified once values'
                    . ' have been added and the record has been saved.'
                )
            ]))
                ->displayIf('InputType')
                ->startsWith('multiple-choice:')
                ->end()
        );

        /** @noinspection PhpUndefinedMethodInspection */
        $fields->dataFieldByName('IsBusinessOwner')
            ->displayIf('InputType')
            ->isEqualTo('email');
        $fields->dataFieldByName('IsProductName')
            ->setTitle('Does this field contain a product name?')
            ->displayIf('InputType')
            ->isEqualTo('text');
        $fields->dataFieldByName('IsBusinessOwnerName')
            ->setTitle('Does this field contain a Business Owner name?')
            ->displayIf('InputType')
            ->isEqualTo('text');
        $fields->dataFieldByName('MinLength')
            ->displayUnless('InputType')
            ->startsWith('multiple-choice');
        $fields->dataFieldByName('PlaceHolder')
            ->displayUnless('InputType')
            ->startsWith('multiple-choice');

        return $fields;
    }

    /**
     * @param SchemaScaffolder $scaffolder Scaffolder
     * @return SchemaScaffolder
     */
    public function provideGraphQLScaffolding(SchemaScaffolder $scaffolder)
    {
        // Provide entity type
        $scaffolder
            ->type(AnswerInputField::class)
            ->addFields([
                'ID',
                'Label',
                'InputType',
                'Required',
                'MinLength',
                'GQLMultiChoiceAnswer' => 'Contains json-encoded, serialized data, representing multiple-choice answers.',
                'MultiChoiceSingleAnswerDefault' => 'An integer representing the default, single-selection, multiple-choice option.',
                'GQLMultiChoiceMultipleAnswerDefault' => 'Contains json-encoded, serialized data, representing default multi-selections.',
            ]);

        return $scaffolder;
    }

    /**
     * OverLoaded getter for the "MultiChoiceAnswer" field. See the following issue
     * on GH for context for why this is needed: https://github.com/silverstripe/silverstripe-graphql/issues/234.
     *
     * @return string
     */
    public function getGQLMultiChoiceAnswer()
    {
        $optionData = [];

        if ($val = $this->dbObject('MultiChoiceAnswer')->getValue()) {

            foreach ($val as $key => $value) {

                $data['value'] = $key;
                $data['label'] = $value;

                $optionData[] = $data;
          }
        }

        return json_encode($optionData);
    }

    /**
     * OverLoaded getter for the "MultiChoiceMultipleAnswerDefault" field. See the following issue
     * on GH for context for why this is needed: https://github.com/silverstripe/silverstripe-graphql/issues/234.
     *
     * @return string
     */
    public function getGQLMultiChoiceMultipleAnswerDefault()
    {
        return json_encode($this->dbObject('MultiChoiceMultipleAnswerDefault')->getValue() ?: []);
    }

    /**
     * @return boolean
     */
    public function isMultipleChoice() : bool
    {
        return strstr($this->InputType, 'multiple-choice');
    }

    /**
     * @return boolean
     */
    public function isMultipleChoiceSingle() : bool
    {
        if (!$this->isMultipleChoice()) {
            return false;
        }

        return $this->InputType === 'multiple-choice: single selection';
    }

    /**
     * Simply returns the correct label fragment to use in CMS help-text,
     *
     * @return string
     */
    private function multiSelectionFieldName()
    {
        return $this->isMultipleChoiceSingle() ? 'radio button' : 'checkbox';
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
     * @return ValidationResult
     */
    public function validate()
    {
        $validationResult = parent::validate();

        // Run validation result specific to the selected InputType.
        return $this->validateInputType($validationResult);
    }

    /**
     * Validation routine, specific to the selection made in the "InputType" field.
     *
     * @param  ValidationResult $validationResult The result passed in from validate().
     * @return ValidationResult
     */
    protected function validateInputType(ValidationResult $validationResult)
    {
        if ($this->isMultipleChoiceSingle()) {
            $validationField = 'MultiChoiceAnswer';
            $validationFieldValue = $this->dbObject('MultiChoiceAnswer')->getValues();

            if ($this->MultiChoiceSingleAnswerDefault > count($validationFieldValue)) {
                $validationResult->addFieldError(
                    $validationField,
                    'The default choice cannot exceed the total number of available choices.'
                );
            }
        }

        return $validationResult;
    }
}
