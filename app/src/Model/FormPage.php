<?php

/**
 * This file contains the "FormPage" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace SDLT\Model;

use SilverStripe\Forms\FieldList;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\HasManyList;

/**
 * Class FormPage
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
class FormPage extends DataObject implements ScaffoldingProvider
{
    /**
     * @var string
     */
    private static $table_name = 'FormPage';

    /**
     * @var array
     */
    private static $db = [
        'Title' => 'Varchar(255)',
        'Question' => 'Text',
        'Description' => 'Text',
        'Type' => 'Enum(array("Input", "Action"))',
    ];

    /**
     * A form page can have either inputs or actions, but not both
     * This will be enforced by the `getCMSFields` and `beforeWrite`(//TODO)
     *
     * @var array
     */
    private static $has_many = [
        'Inputs' => FormInput::class,
        'Actions' => FormAction::class
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
        'Type'
    ];

    /**
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        if ($this->Type === 'Input') {
            $fields->removeByName('Actions');
        }
        if ($this->Type === 'Action') {
            $fields->removeByName('Inputs');
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
            ->type(FormPage::class)
            ->addFields([
                'ID',
                'Title',
                'Question',
                'Description',
                'Type'
            ]);

        // Provide relations
        $typeScaffolder
            ->nestedQuery('Inputs')
            ->setUsePagination(false)
            ->end();
        $typeScaffolder
            ->nestedQuery('Actions')
            ->setUsePagination(false)
            ->end();

        return $scaffolder;
    }
}
