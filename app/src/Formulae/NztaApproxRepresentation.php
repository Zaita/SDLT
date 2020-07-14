<?php

/**
 * This file contains the "NztaApproxRepresentation" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright NZ Transport Agency
 * @license BSD-3
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
    const PRECISION = 2;

    /**
     * Perform an implementation-specific calculation.
     *
     * @return mixed int|float
     */
    public function calculate()
    {
        return number_format($this->highest() + (
            ((self::MEAN_LHS_OPERAND * $this->mean()) + (self::MEDIAN_LHS_OPERAND * $this->median())) *
            self::MULTIPLIER
        ), self::PRECISION);
    }

    /**
     * Return the average value of an array of numbers of any kind.
     *
     * Note: Average is calculated with the removal of the highest weighting.
     * if single value then return 0
     *
     * @return mixed int|float
     */
    public function mean()
    {
        $weights = self::normalise();
        $count = count($weights);

        if ($count == 0) {
            return 0;
        }

        $sum = array_sum($weights);

        if ($sum === 0) {
            return 0;
        }

        return ($count > 0)
                ? number_format($sum / $count, self::PRECISION)
                : 0;
    }

    /**
     * Return the median value of an array of integers. Will deal with multiple
     * median value scenarios such as: 1,2,3,3,4,5 as well as various zero-value
     * situations.
     *
     * If no median is found, the laws of mathematics have been violated.
     *
     * Note: Median is calculated with the removal of the highest weighting.
     * if single value then return 0
     *
     * @return mixed int|float
     */
    public function median()
    {
        $weights = self::normalise();
        $count = count($weights);

        if ($count == 0) {
            return 0;
        }

        $middle = floor(($count - 1) / 2);

        if ($count % 2) {
            return $weights[$middle];
        }

        $low = $weights[$middle];
        $high = $weights[$middle + 1];

        return number_format((($low + $high) / 2), self::PRECISION);
    }

    /**
     * Return the highest value of an array of numbers of any kind.
     *
     * @return mixed int|float
     */
    public function highest()
    {
        return count($this->weightings)
            ? max($this->weightings)
            : 0;
    }

    /**
     * @return array
     */
    private function normalise()
    {
        $weights = $this->weightings;
        sort($weights);
        // Remove highest weighting
        array_pop($weights);

        return $weights;
    }
}
