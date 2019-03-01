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
 * @method HasManyList Inputs()
 * @method HasManyList Actions()
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
        'AnswerFieldType' => 'Enum(array("Input", "Action"))',
    ];

    /**
     * A question's answer can have fields type either inputs or actions, but not both
     * This will be enforced by the `getCMSFields` and `beforeWrite`(//TODO)
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
        'Questionnaire' => Questionnaire::class
    ];

    /**
     * @var array
     */
    private static $summary_fields = [
        'Title',
        'Question',
        'AnswerFieldType'
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
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        $fields->removeByName('QuestionnaireID');

        if ($this->AnswerFieldType === 'Input') {
            $fields->removeByName('AnswerActionFields');
        }
        if ($this->AnswerFieldType === 'Action') {
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
}
