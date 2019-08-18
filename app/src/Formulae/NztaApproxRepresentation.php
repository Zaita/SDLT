<?php

/**
 * This file contains the "NztaApproxRepresentation" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright 2019 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Formulae;

use NZTA\SDLT\Formulae\RiskFormula;

/**
 * The "NztaApproxRepresentation" subclass of {@link RiskFormula}, a formula
 * used in base impact rating calculations.
 *
 * To calculate the base impact rating, use the following formula:
 *
 * - Average and Median weightings are calculated from the dataset
 * - Highest weightings are removed
 * - Formula: Highest weighting + (((3 * mean) + (2 * median)) * 0.25)
 */
class NztaApproxRepresentation extends RiskFormula
{
    /**
     * @var int
     */
    const MEAN_LHS_OPERAND = 3;

    /**
     * @var int
     */
    const MEDIAN_LHS_OPERAND = 2;

    /**
     * @var float
     */
    const MULTIPLIER = 0.25;

    /**
     * @var int
     */
    const FORMATTER = 2;

    /**
     * Perform an implementation-specific calculation.
     *
     * @return mixed int|float
     */
    public function calculate()
    {
        return number_format($this->highest() + (
            (self::MEAN_LHS_OPERAND * $this->mean() + self::MEDIAN_LHS_OPERAND * $this->median()) *
            self::MULTIPLIER
        ), self::FORMATTER);
    }

    /**
     * Return the average value of an array of numbers of any kind.
     *
     * Note: Average is calculated with the removal of the highest weighting.
     *
     * @return mixed int|float
     */
    public function mean()
    {
        sort($this->weightings);
        // Remove highest weighting
        array_pop($this->weightings);

        $sum = array_sum($this->weightings);

        if ($sum === 0) {
            return 0;
        }

        return $sum / count($this->weightings);
    }

    /**
     * Return the median value of an array of integers. Will deal with multiple
     * median value scenarios such as: 1,2,3,3,4,5 as well as various zero-value
     * situations.
     *
     * If no median is found, the laws of mathematics have been violated.
     *
     * Note: Median is calculated with the removal of the highest weighting.
     *
     * @return mixed int|float
     */
    public function median()
    {
        sort($this->weightings);
        $origTotal = count($this->weightings);

        if ($origTotal === 1) {
            return end($this->weightings);
        }

        // Remove highest weighting
        array_pop($this->weightings);

        $total = count($this->weightings);

        if ($total === 1) {
            return end($this->weightings);
        }

        $middle = floor(($total - 1) / 2);

        if ($total % 2) {
            return $this->weightings[$middle];
        }

        $middle = $this->weightings[$middle] ?? 0;

        if ($middle === 0) {
            return 0;
        }

        return ($middle + $middle + 1) / 2;
    }

    /**
     * Return the highest value of an array of numbers of any kind.
     *
     * @return mixed int|float
     */
    public function highest()
    {
        return max($this->weightings);
    }
}
