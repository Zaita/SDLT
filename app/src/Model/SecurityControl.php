<?php

/**
 * This file contains the "SecurityControl" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Model;

use SilverStripe\ORM\DataObject;
use SilverStripe\Forms\TextField;
use SilverStripe\Forms\TextareaField;
use SilverStripe\Control\Controller;
use SilverStripe\Forms\NumericField;
use SilverStripe\Forms\LiteralField;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridFieldConfig_RelationEditor;
use SilverStripe\Forms\GridField\GridFieldEditButton;
use Symbiote\GridFieldExtensions\GridFieldEditableColumns;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\GridField\GridFieldAddExistingAutocompleter;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;

/**
 * Class SecurityControl
 *
 * @property string Name
 * @property string Description
 * @property SecurityComponent Component
 */
class SecurityControl extends DataObject implements ScaffoldingProvider
{
    /**
     * @var string
     */
    const CTL_STATUS_1 = 'Realised';
    const CTL_STATUS_2 = 'Intended';
    const CTL_STATUS_3 = 'Not Applicable';

    /**
     * @var string
     */
    private static $table_name = 'SecurityControl';

    /**
     * @var array
     */
    private static $db = [
        'Name' => 'Varchar(255)',
        'Description' => 'Text',
        'Status' => "Enum('" .
            self::CTL_STATUS_1 . "," .
            self::CTL_STATUS_2 . "," .
            self::CTL_STATUS_3 .
        "')",
    ];

    /**
     * @var array
     */
    private static $has_many = [
        'ControlWeightSets' => ControlWeightSet::class
    ];

    /**
     * @var array
     */
    private static $belongs_many_many = [
        'SecurityComponent' => SecurityComponent::class
    ];

    /**
     * @param SchemaScaffolder $scaffolder Scaffolder
     * @return SchemaScaffolder
     */
    public function provideGraphQLScaffolding(SchemaScaffolder $scaffolder)
    {
        // Provide entity type
        $typeScaffolder = $scaffolder
            ->type(self::class)
            ->addFields([
                'ID',
                'Name',
                'Description',
            ]);

        return $typeScaffolder;
    }

    /**
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        $name = TextField::create('Name')
            ->setDescription('This is the title of the control. It is displayed'
            .' as the title as the line-item of a checklist.');

        $desc = TextareaField::create('Description')
            ->setDescription('This contains the description that appears under'
            .' the title of a line-item in the component checklist.');

        $fields->addFieldsToTab('Root.Main', [$name, $desc]);
        $fields->removeByName(['SecurityComponent', 'ControlWeightSets']);

        if ($this->ID) {
            // Allow inline-editing
            $componentEditableFields = (new GridFieldEditableColumns())
                ->setDisplayFields([
                    'Likelihood' => [
                        'title' => 'Likelihood',
                        'field' => NumericField::create('Likelihood')
                    ],
                    'Impact' => [
                        'title' => 'Impact',
                        'field' => NumericField::create('Impact')
                    ],
                    'LikelihoodPenalty' => [
                        'title' => 'Likelihood Penalty',
                        'field' => NumericField::create('LikelihoodPenalty')
                    ],
                    'ImpactPenalty' => [
                        'title' => 'Impact Penalty',
                        'field' => NumericField::create('ImpactPenalty')
                    ],
                ]);

            $config = GridFieldConfig_RelationEditor::create()
                ->addComponent($componentEditableFields, GridFieldEditButton::class)
                ->removeComponentsByType(GridFieldAddExistingAutocompleter::class);

            $gridField = GridField::create(
                'ControlWeightSets',
                'Control Weight Sets',
                $this->ControlWeightSets()
                    ->filter(['SecurityComponentID' => $this->getParentComponentID()]),
                $config
            );

            $fields->addFieldsToTab('Root.Main', FieldList::create([
                    LiteralField::create(
                        'ControlWeightSetIntro',
                        '<p class="message notice">A <b>Control Weight Set</b> ' .
                        'is a combination of Risk, Likelihood, Impact and Penalties ' .
                        'that is unique to a Control.</p>'
                    ),
                    $gridField
                ])
            );
        }

        return $fields;
    }

    /**
     * Get parent component id
     *
     * @return int
     */
    public function getParentComponentID()
    {
        $req = Controller::curr()->getRequest();
        $reqParts = explode('NZTA-SDLT-Model-SecurityComponent/item/', $req->getUrl());

        if (!empty($reqParts) && isset($reqParts[1])) {
            return (int) strtok($reqParts[1], '/');
        }

        return 0;
    }
}
