<?php

/**
 * This file contains the "RiskRating" class.
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
use SilverStripe\ORM\FieldType\DBVarchar;
use SilverStripe\ORM\FieldType\DBField;
use SilverStripe\ORM\FieldType\DBHTMLText;
use SilverStripe\ORM\ValidationResult;
use SilverStripe\Forms\DropdownField;
use NZTA\SDLT\Model\Task;
use NZTA\SDLT\Model\LikelihoodThreshold;
use TractorCow\Colorpicker\Color;
use TractorCow\Colorpicker\Forms\ColorField;

/**
 * A "RiskRating" is a record comprising {@link LikelihoodThreshold} and manually
 * entered data to comprise a "Risk Rating Matrix".
 */
class RiskRating extends DataObject
{
    /**
     * @var array
     */
    private static $db = [
        'RiskRating' => DBVarchar::class,
        'Colour' => Color::class,
        'Impact' => DBVarchar::class,
    ];

    /**
     * @var array
     */
    private static $has_one = [
        'Likelihood' => LikelihoodThreshold::class,
        'Task' => Task::class,
    ];

    /**
     * @var array
     */
    private static $summary_fields = [
        'RiskRating',
        'Impact',
        'Likelihood.Name' => 'Likelihood',
        'getSummaryColour' => 'Colour'
    ];

    /**
     * @var string
     */
    private static $table_name = 'RiskRating';

    /**
     * @return DBField
     */
    public function getSummaryColour()
    {
        return DBField::create_field(
            DBHTMLText::class,
            sprintf('<div style="width:30px;height:30px;background:#%s;"></div>', $this->owner->Colour)
        );
    }

    /**
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        $fields->removeFieldFromTab('Root.Main', 'TaskID');
        $fields->dataFieldByName('Impact')->setTitle('Impact Rating');
        $fields->addFieldsToTab('Root.Main', [
            DropdownField::create(
                'LikelihoodID',
                'Likelihood',
                LikelihoodThreshold::get()->map()->toArray()
            ),
            ColorField::create(
                'Colour',
                'Colour'
            )
                ->setAttribute(
                    'placeholder',
                    'Focus to open a colour-picker, or start typing a hex colour.'
                )
        ]);

        return $fields;
    }

    /**
     * @return ValidationResult
     */
    public function validate() : ValidationResult
    {
        $result = parent::validate();

        foreach (['RiskRating', 'Colour', 'Impact'] as $fieldName) {
            if (!$this->$fieldName) {
                $result->addError(sprintf('Please fill out the "%s" field.', $fieldName));
            }
        }

        return $result;
    }
}
