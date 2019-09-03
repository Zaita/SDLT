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

/**
 * Class ImpactThreshold. Represents an admin-managed record for association with
 * Base Impact Ratings.
 */
class ImpactThreshold extends DataObject
{
    /**
     * @var string
     */
    private static $table_name = 'ImpactThreshold';

    /**
     * If $operator and $operand match an impact-rating, return it.
     *
     * @param  mixed int|float  $operand  The RHS operand to compare against the
     *                                    "Value" field.
     * @return mixed null|ImpactThreshold  An instance of {@link ImpactThreshold}
     *                                    if a match is found, or null otherwise.
     * Note: This method is limited in scope.In the event of an operand set where
     *       an operand is _both_ ">" and ">=" some value, then first "hit" is
     *       returned. This is simply a case for the user to consider, when configuring
     *       thresholds within the SDLT, using incremental or "stepped" thresholds.
     */
    public static function match($operand)
    {
        $operand = str_replace(',', '', $operand);

        foreach (array_keys(static::config()->get('operators')) as $op) {
            $where = sprintf("Operator = '%s' AND %s %s Value", $op, $operand, $op);
            $sort = sprintf('ABS(Value - %s)', $operand);

            $matches = self::get()
                    ->where($where)
                    ->sort($sort);

            // Conflict resolution: Always take the first match
            if ($matches && $result = $matches->first()) {
                return $result;
            }
        }

        return null;
    }
}
