<?php

/**
 * This file contains the "Maximum" class.
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
 * The "Maximum" subclass of {@link RiskFormula} is a simple highest-number only
 * formula, used in base impact rating calculations.
 */
class Maximum extends RiskFormula
{
    /**
     * Perform an implementation-specific calculation.
     *
     * @return mixed int|float
     */
    public function calculate()
    {
        return $this->highest();
    }

    /**
     * Return the highest value of an array of numbers.
     *
     * @return mixed int|float
     */
    public function highest()
    {
        return max($this->weightings);
    }
}
