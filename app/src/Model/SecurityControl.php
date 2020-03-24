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
use SilverStripe\Forms\HTMLEditor\HtmlEditorField;

/**
 * Class SecurityControl
 *
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
        'Description' => 'HTMLText',
        'ImplementationGuidance' => 'HTMLText',
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
     * @var array
     */
    private static $summary_fields = [
        'Name' => 'Name',
        'Description' => 'Description',
        'usedOnComponent' => 'Used On',
    ];

    /**
     * @var array
     */
    private static $searchable_fields = [
        'Name',
        'Description'
    ];

    /**
     * Default sort ordering
     * @var array
     */
    private static $default_sort = ['Name' => 'ASC'];

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
                'ImplementationGuidance'
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

        $desc = HtmlEditorField::create('Description')
            ->setDescription('This contains the description that appears under'
            .' the title of a line-item in the component checklist.');

        $implementationGuidance = HtmlEditorField::create('ImplementationGuidance');

        $fields->addFieldsToTab('Root.Main', [$name, $desc, $implementationGuidance]);
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
                ]));
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
        if (Controller::has_curr()) {
            $req = Controller::curr()->getRequest();
            $reqParts = explode('NZTA-SDLT-Model-SecurityComponent/item/', $req->getUrl());

            if (!empty($reqParts) && isset($reqParts[1])) {
                return (int) strtok($reqParts[1], '/');
            }
        }

        return 0;
    }

    /**
     * create control from json import
     *
     * @param object $controls  control json object
     * @param object $component component dataobject
     *
     * @return void
     */
    public static function create_record_from_json($controls, $component)
    {
        foreach ($controls as $control) {
            $controlObj = self::get_by_name($control->name);

            // if obj doesn't exist with the same name then create a new object
            if (empty($controlObj)) {
                $controlObj = self::create();
            }

            $controlObj->Name = $control->name ?? '';

            // control can be reuse with the another component but if description exist then
            // overwrite the control description with new one
            if (property_exists($control, "description")) {
                $controlObj->Description = $control->description;
            }

            if (property_exists($control, "implementationGuidance")) {
                $controlObj->ImplementationGuidance = $control->implementationGuidance;
            }

            $controlObj->SecurityComponent()->add($component);
            $controlObj->write();

            if (property_exists($control, "controlWeightSets") &&
                !empty($weights = $control->controlWeightSets)) {
                ControlWeightSet::create_record_from_json($weights, $controlObj, $component);
            }
        }
    }

    /**
     * get security control by name
     *
     * @param string $controlName security control name
     * @return object|null
     */
    public static function get_by_name($controlName)
    {
        $control = SecurityControl::get()
            ->filter(['Name' => $controlName])
            ->first();

        return $control;
    }

    /**
     * @return ValidationResult
     */
    public function validate()
    {
        $result = parent::validate();

        $control = self::get()
            ->filter([
                'Name' => $this->Name
            ])
            ->exclude('ID', $this->ID);

        if ($control->count()) {
            $result->addError(
                sprintf(
                    'Control with name "%s" already exists, please create a unique control.',
                    $this->Name
                )
            );
        }

        return $result;
    }

    /**
     * @return string
     */
    public function usedOnComponent()
    {
        $components = $this->SecurityComponent();
        $componentName = '';

        if ($components) {
            $componentName = implode(", ", $components->column('Name'));
        }

        return $componentName;
    }

    /**
     * export control
     *
     * @param integer $control control
     * @return string
     */
    public static function export_record($control)
    {
        $obj['name'] = $control->Name;
        $obj['description'] = $control->Description ?? '';
        $obj['implementationGuidance'] = $control->ImplementationGuidance ?? '';

        foreach ($control->ControlWeightSets() as $weight) {
            $obj['controlWeightSets'][] = ControlWeightSet::export_record($weight);
        }

        return $obj;
    }
}
