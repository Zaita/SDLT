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

        $fields->removeByName('SecurityComponent');

        return $fields;
    }

    /**
     * @return ValidationResult
     */
    public function validate()
    {
        $result = parent::validate();

        // Validate the ManyManyExtraFields:
        // Cannot rely on $this->$fieldName for validation. Framework seems to only
        // validate _after_ saving.
        $postVars = Controller::curr()->getRequest()->postVar('ManyMany');

        foreach (array_keys(SecurityComponent::config()->get('many_many_extraFields')['Controls']) as $fieldName) {
            $limit = strstr($fieldName, 'Penalty') ? 100 : 10;

            if ($postVars[$fieldName] > $limit) {
                $result->addError(sprintf(
                    '%s cannot be greater than %d.',
                    TextField::name_to_label($fieldName),
                    $limit
                ));
            }
        }

        return $result;
    }
}
