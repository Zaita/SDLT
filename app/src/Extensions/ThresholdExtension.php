<?php

/**
 * This file contains the "ThresholdExtension" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright NZ Transport Agency
 * @license BSD-3
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Extension;

use SilverStripe\ORM\DataExtension;
use SilverStripe\ORM\FieldType\DBVarchar;
use SilverStripe\ORM\FieldType\DBField;
use SilverStripe\ORM\FieldType\DBHTMLText;
use SilverStripe\Forms\DropdownField;
use SilverStripe\ORM\ValidationResult;
use SilverStripe\Forms\FieldList;
use SilverStripe\ORM\FieldType\DBInt;
use TractorCow\Colorpicker\Color;
use TractorCow\Colorpicker\Forms\ColorField;

/**
 * Class ThresholdExtension.
 *
 * @see {@link LikelihoodThreshold}
 * @see {@link ImpactThreshold}
 */
class ThresholdExtension extends DataExtension
{
    /**
     * @var array
     */
    private static $db = [
        'Name' => DBVarchar::class,
        'Value' => DBInt::class,
        'Colour' => Color::class,
        'Operator' => DBVarchar::class,
    ];

    /**
     * @var array
     */
    private static $summary_fields = [
        'Name',
        'Operator',
        'Value',
        'getSummaryColour' => 'Colour'
    ];

    /**
     * @var array
     */
    private static $operators = [
        '<' => 'Number is less than (<)',
        '>' => 'Number is greater than (>)',
        '<=' => 'Number is less than or equal to (<=)',
        '>=' => 'Number is greater than or equal to (>=)',
    ];

    /**
     * @return DBField
     */
    public function getSummaryColour()
    {
        return DBField::create_field(
            DBHTMLText::class,
            sprintf('<div style="width:30px;height:30px;background:%s;"></div>', $this->getHexColour())
        );
    }

    /**
     * Get hexadecimal colour with # prefix
     *
     * @return string
     */
    public function getHexColour()
    {
        return sprintf("#%s", $this->owner->Colour);
    }

    /**
     * @param  FieldList
     * @return void
     */
    public function updateCMSFields(FieldList $fields)
    {
        // Operator
        $fields->addFieldToTab(
            'Root.Main',
            DropdownField::create(
                'Operator',
                'Operator',
                $this->owner->config()->get('operators')
            )->setEmptyString('-- Select One --'),
            'Colour'
        );

        // Color
        $fields->addFieldToTab(
            'Root.Main',
            ColorField::create(
                'Colour',
                'Colour'
            )->setAttribute(
                'placeholder',
                'Focus to open a colour-picker, or start typing a hex colour.'
            )
        );
    }

    /**
     * @param  mixed Member|null $member
     * @return boolean
     */
    public function canDelete($member = null)
    {
        return false;
    }

    /**
     * @return ValidationResult
     */
    public function validate(ValidationResult $validationResult) : ValidationResult
    {
        $result = $validationResult;

        if (!$this->owner->Name) {
            $result->addError('Please enter a value for the "Name" field.');
        } else if (!$this->owner->Value) {
            $result->addError('Please enter a valid value for the "Value" field.');
        } else if (!$this->owner->Colour) {
            $result->addError('Please select a colour.');
        } else if (!$this->owner->Operator) {
            $result->addError('Please select an operator.');
        }

        return $result;
    }
}
