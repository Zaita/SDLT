<?php

/**
 * This file contains the "FormInput" class.
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

/**
 * Class FormInput
 *
 * @property string Name
 * @property string Type
 *
 * @property FormPage Page
 */
class FormInput extends DataObject implements ScaffoldingProvider
{
    /**
     * @var string
     */
    private static $table_name = 'FormInput';

    /**
     * @var array
     */
    private static $db = [
        'Name' => 'Varchar(255)',
        'Type' => 'Enum(array("text", "email", "textarea", "date"))',
        'Required' => 'Boolean',
        'MinLength' => 'Int'
    ];

    /**
     * @var array
     */
    private static $has_one = [
        'Page' => FormPage::class
    ];

    /**
     * @var array
     */
    private static $summary_fields = [
        'Name',
        'Type'
    ];

    /**
     * @param SchemaScaffolder $scaffolder Scaffolder
     * @return SchemaScaffolder
     */
    public function provideGraphQLScaffolding(SchemaScaffolder $scaffolder)
    {
        // Provide entity type
        $typeScaffolder = $scaffolder
            ->type(FormInput::class)
            ->addFields([
                'ID',
                'Name',
                'Type',
                'Required',
                'MinLength'
            ]);

        return $scaffolder;
    }
}
