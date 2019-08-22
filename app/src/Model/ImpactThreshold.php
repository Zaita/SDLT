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
     * @var array
     */
    private static $operators = [
        '<=' => 'Score is less than or equal to (<=)',
        '>' => 'Score is greater than (>)',
    ];

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
}
