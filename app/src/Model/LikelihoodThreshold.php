<?php

/**
 * This file contains the "LikelihoodThreshold" class.
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
use SilverStripe\Forms\FieldList;
use SilverStripe\ORM\ValidationResult;
use NZTA\SDLT\Model\Task;
use NZTA\SDLT\Model\RiskRating;

/**
 * Class LikelihoodThreshold. Represents an admin-managed record for calculation
 * of Likelihood Ratings.
 */
class LikelihoodThreshold extends DataObject
{
    /**
     * The list of likelihood thresholds must be a sorted list
     * This means we can exit the calculator as soon as the first condition is
     * met
     *
     * In the case of a tie on the value, sort by <, <=, >, >=
     *
     * @var string
     */
    private static $default_sort = 'Value ASC, Operator ASC';
    /**
     * @var array
     */
    private static $has_one = [
        'Task' => Task::class,
    ];

    /**
     * @var array
     */
    private static $belongs_to = [
        'RiskRating' => RiskRating::class,
    ];

    /**
     * @var string
     */
    private static $table_name = 'LikelihoodThreshold';

    /**
     * @return FieldList
     */
    public function getCMSFields() : FieldList
    {
        $fields = parent::getCMSFields();

        $fields->removeFieldFromTab('Root.Main', 'TaskID');

        return $fields;
    }

    /**
     * @return ValidationResult
     */
    public function validate() : ValidationResult
    {
        $result = parent::validate();

        if ($this->Value > 100 || $this->Value <= 0) {
            $result->addError('"Value" represents a percentage and therefore ' .
                'cannot be less than or equal to zero, or exceed 100.');
        }

        return $result;
    }

    /**
     * If $operator and $operand match an likelihood-rating, return it.
     *
     * @param mixed int|float $operand The RHS operand to compare against the
     *                                 "Value" field.
     * @param int             $taskID  Security Risk Assessment task id
     * @return mixed null|LikelihoodThreshold  An instance of
     *                  {@link LikelihoodThreshold} if a match is found, or null
     *                   otherwise.
     * Note: This method is limited in scope. In the event that an operand is set
     *       where it's _both_ ">" and ">=" <N>, then the first "hit" is returned.
     *       This is simply a case for admin users to consider when configuring
     *       thresholds within the SDLT, with the use of incremental or "stepped"
     *       thresholds.
     */
    public static function match($operand, $taskID)
    {
        $operand = str_replace(',', '', $operand);
        $sort = sprintf('ABS(Value - %s) ASC', $operand);
        $thresholds = self::get()
            ->filter(['TaskID' => $taskID])
            ->sort($sort);

        foreach ($thresholds as $threshold) {
            $opr = $threshold->Operator;
            $val = $threshold->Value;

            switch ($opr) {
                case '<':
                    if ($operand < $val) {
                        return $threshold;
                    }
                    break;
                case '<=':
                    if ($operand <= $val) {
                        return $threshold;
                    }
                    break;
                case '>':
                    if ($operand > $val) {
                        return $threshold;
                    }
                    break;
                case '>=':
                    if ($operand >= $val) {
                        return $threshold;
                    }
                    break;
                default:
                    return null;
            }
        }

        return null;
    }
}
