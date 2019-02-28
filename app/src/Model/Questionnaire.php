<?php

/**
 * This file contains the "Questionnaire" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace SDLT\Model;

use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\HasManyList;

/**
 * Class Questionnaire
 *
 * @property string Name
 * @property string KeyInformation
 *
 * @method HasManyList Pages
 */
class Questionnaire extends DataObject implements ScaffoldingProvider
{
    /**
     * @var string
     */
    private static $table_name = 'Questionnaire';

    /**
     * @var array
     */
    private static $db = [
        'Name' => 'Varchar(255)',
        'KeyInformation' => 'HTMLText'
    ];

    /**
     * @var array
     */
    private static $has_many = [
        'Pages' => FormPage::class
    ];

    /**
     * @param SchemaScaffolder $scaffolder Scaffolder
     * @return SchemaScaffolder
     */
    public function provideGraphQLScaffolding(SchemaScaffolder $scaffolder)
    {
        // Provide entity type
        $typeScaffolder = $scaffolder
            ->type(Questionnaire::class)
            ->addFields([
                'ID',
                'Name',
                'KeyInformation'
            ]);

        // Provide relations
        $typeScaffolder
            ->nestedQuery('Pages')
            ->setUsePagination(false)
            ->end();

        // Provide operations
        $typeScaffolder
            ->operation(SchemaScaffolder::READ_ONE)
            ->setName('readQuestionnaire')
            ->end();

        /* Example query:
        query{
          readQuestionnaire(ID:1) {
            ID
            Name
            KeyInformation
            Pages {
              ID
              Title
              Question
              Description
              Type
              Inputs {
                ID
                Name
                Type
                Required
                MinLength
              }
              Actions {
                ID
                Name
                Type
                Message
              }
            }
          }
        }
        */

        return $scaffolder;
    }
}