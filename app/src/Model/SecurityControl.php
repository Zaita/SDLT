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
use SilverStripe\ORM\FieldType\DBInt;
use SilverStripe\Forms\NumericField;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridFieldConfig_RelationEditor;
use SilverStripe\Forms\GridField\GridFieldEditButton;
use Symbiote\GridFieldExtensions\GridFieldEditableColumns;
use SilverStripe\Core\Injector\Injector;
use SilverStripe\Forms\GridField\GridFieldAddExistingAutocompleter;

/**
 * Class SecurityControl
 *
 * @property string Name
 * @property string Description
 * @property SecurityComponent Component
 */
class SecurityControl extends DataObject
{
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
     * get cms fields
     *
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
            // Allow inline-editing for the "Weight" value
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

            $gridField = new GridField(
                'ControlWeightSets',
                'Control Weight Sets',
                $this->ControlWeightSets()
                    ->filter(["SecurityComponentID" => $this->getParentComponentID()]),
                $config
            );

            $fields->addFieldToTab(
              'Root.Main',
              $gridField
            );
        }

        return $fields;
    }

    /**
     * get parent component id
     *
     * @return FieldList
     */
    public function getParentComponentID()
    {
        $req = Controller::curr()->getRequest();

        $reqParts = explode('NZTA-SDLT-Model-SecurityComponent/item/', $req->getUrl()) ;

        if (!empty($reqParts) && isset($reqParts[1])) {
            return (int) strtoK($reqParts[1], '/');
        }

        return 0;
    }
}
