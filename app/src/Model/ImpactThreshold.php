<?php

/**
 * This file contains the "ImpactThreshold" class.
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
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\DropdownField;
use SilverStripe\ORM\ValidationResult;
use SilverStripe\ORM\FieldType\DBField;
use SilverStripe\ORM\FieldType\DBHTMLText;
use TractorCow\Colorpicker\Color;
use TractorCow\Colorpicker\Forms\ColorField;

/**
 * Class ImpactThreshold. Represents an admin-managed record for association with
 * Base Impact Ratings.
 */
class ImpactThreshold extends DataObject
{
    /**
     * @var array
     */
    private static $db = [
        'Name' => DBVarchar::class,
        'Value' => DBVarchar::class,
        'Colour' => Color::class,
        'Operator' => DBVarchar::class,
    ];

    /**
     * @var string
     */
    private static $table_name = 'ImpactThreshold';

    /**
     * @var array
     */
    private static $operators = [
        '<=' => 'Score is less than or equal to (<=)',
        '>' => 'Score is greater than (>)',
    ];

    /**
     * @var array
     */
    private static $summary_fields = [
        'Name',
        'Value',
        'getSummaryColour' => 'Colour'
    ];

    /**
     * @return DBField
     */
    public function getSummaryColour()
    {
        return DBField::create_field(
                DBHTMLText::class,
                sprintf('<div style="width:30px;height:30px;background:#%s;"></div>', $this->Colour)
            );
    }

    /**
     * If $operator and $operand match an impact-rating, return it.
     *
     * @param  mixed int|float  $operand  The RHS operand to compare against the
     *                                    "Value" field.
     * @return mixed null|ImpactThreshold  An instance of {@link ImpactThreshold} if a match
     *                          is found, or null otherwise.
     */
    public static function match($operand)
    {
        foreach ([
            '<=' => 'LessThanOrEqual',
            '>' => 'GreaterThan'
        ] as $op => $filter) {
            $where = sprintf("Operator = '%s' AND %s %s Value", $op, $operand, $op);
            $sort = sprintf('ABS(Value - %s)', $operand);
            $matches = self::get()
                    ->where($where)
                    ->sort($sort);

            if ($matches && $matches->count()) {
                return $matches->first();
            }
        }

        return null;
    }

    /**
     * @return FieldList
     */
    public function getCMSFields() : FieldList
    {
        $fields = parent::getCMSFields();

        // Operator
        $fields->addFieldToTab(
            'Root.Main',
            DropdownField::create(
                'Operator',
                'Operator',
                $this->config()->get('operators')
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

        return $fields;
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
    public function validate() : ValidationResult
    {
        $result = parent::validate();

        if (!$this->Name) {
            $result->addError('Please enter a value for the "Name" field.');
        } else if (!$this->Value) {
            $result->addError('Please enter a valid value for the "Value" field.');
        } else if (!$this->Colour) {
            $result->addError('Please select a colour.');
        } else if (!$this->Operator) {
            $result->addError('Please select an operator.');
        }

        return $result;
    }
}
