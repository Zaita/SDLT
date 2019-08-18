<?php
/**
 * This file contains the "Utils" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright 2019 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Helper;

use SilverStripe\Forms\FormField;
use SilverStripe\ORM\DataObject;

/**
 * Static helper methods.
 */
class Utils
{
    /**
     * Simple formatter for ease of display of ENUM values within {@link DropdownField}
     * instances for the given $model.
     *
     * @param  DataObject $model
     * @param  string     $fieldName
     * @return array
     */
    public static function pretty_source(DataObject $model, string $fieldName) : array
    {
        $source = [];

        foreach ($model->dbObject($fieldName)->enumValues() as $k => $v) {
            $source[$k] = ucfirst(FormField::name_to_label($v));
        }

        asort($source);

        return $source;
    }
}
