<?php

/**
 * This file contains the "SelectedComponent" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright 2019 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Model;

use SilverStripe\ORM\DataObject;
use SilverStripe\Forms\FieldList;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use SilverStripe\Forms\DropdownField;

/**
 * This record allows multiple {@link SecurityComponent} records to be related to many
 * {@link TaskSubmission} records, which results in a unique combination of
 * {@link ProductAspect}
 *
 * Traditionally you'd use a manyMany/ManyManyThrough, but it doesn't allow duplicate relationship
 */
class SelectedComponent extends DataObject implements ScaffoldingProvider
{
    /**
     * @var string
     */
    private static $table_name = 'TaskSubmission_SelectedComponents'; // if we use this name, then we don't need to write a migrate script

    /**
     * @var array
     */
    private static $db = [
        'ProductAspect' => 'Varchar(255)',
    ];

    /**
     * @var array
     */
    private static $has_one = [
        'SecurityComponent' => SecurityComponent::class,
        'TaskSubmission' => TaskSubmission::class
    ];

    private static $belongs_many_many = [
        'DefaultsForTask' => Task::class
    ];

    /**
     * @var array
     */
    private static $summary_fields = [
        'TaskSubmission.TaskName' => 'Task Submission',
        'SecurityComponent.Name' => 'Security Component',
        'ProductAspect',
    ];

    /**
     * @var array
     */
    private static $searchable_fields = [
        'ProductAspect',
        'TaskSubmission.TaskName',
        'SecurityComponent.Name',
    ];

    /**
     * @param SchemaScaffolder $scaffolder The scaffolder
     * @return SchemaScaffolder
     */
    public function provideGraphQLScaffolding(SchemaScaffolder $scaffolder)
    {
        $typeScaffolder = $scaffolder
            ->type(self::class)
            ->addFields([
                'ID',
                'ProductAspect',
                'SecurityComponent',
                'TaskSubmission'
            ]);

        return $typeScaffolder;
    }

    /**
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        $fields->removeByName([
          'TaskSubmissionID'
        ]);

        $fields->addFieldToTab(
            'Root.Main',
            DropdownField::create(
                'TaskSubmissionID',
                'Task Submission',
                TaskSubmission::get()->map('ID', 'TaskName')
            )
        );

        return $fields;
    }

    /**
     * @return ValidationResult
     */
    public function validate()
    {
        $result = parent::validate();

        if (!$this->SecurityComponentID) {
            $result->addError('Please select a Security Component.');
        }

        $filterValues = [
            'TaskSubmissionID' => $this->TaskSubmissionID,
            'SecurityComponentID' => $this->SecurityComponentID,
        ];

        if (!empty($this->ProductAspect)) {
            $filterValues += ['ProductAspect' => $this->ProductAspect];
        }

        $relationshipCount = self::get()
            ->exclude('ID', $this->ID)
            ->filter($filterValues)
            ->count();

        if ($relationshipCount) {
            $result->addError('Please select a unique Task Submission and Security Component.');
        }

        return $result;
    }
}
