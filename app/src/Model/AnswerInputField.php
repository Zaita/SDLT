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
use Symbiote\GridFieldExtensions\GridFieldOrderableRows;

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
    /**
     * @var string
     */
    private static $table_name = 'AnswerInputField';

    /**
     * @var array
     */
    private static $db = [
        'Label' => 'Varchar(255)',
        'InputType' => 'Enum(array("text", "email", "textarea", "date", "url"))',
        'Required' => 'Boolean',
        'MinLength' => 'Int',
        'PlaceHolder' => 'Varchar(255)',
        'SortOrder' => 'Int',
        'IsBusinessOwner' => 'Boolean',
        'IsProductName' => 'Boolean',
        'IsBusinessOwnerName' => 'Boolean',
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

        $fields->removeByName(['QuestionID', 'SortOrder']);

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
            ->type(AnswerInputField::class)
            ->addFields([
                'ID',
                'Label',
                'InputType',
                'Required',
                'MinLength'
            ]);

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
}
