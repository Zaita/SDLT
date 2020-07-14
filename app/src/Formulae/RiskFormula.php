<?php

/**
 * This file contains the "RiskFormula" abstract class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright NZ Transport Agency
 * @license BSD-3
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Formulae;

use SilverStripe\Core\Injector\Injectable;

/**
 * Subclasses provide a specific formulae for calculating base impact ratings.
 */
abstract class RiskFormula
{
    use Injectable;

    /**
     * @var array
     */
    protected $weightings = [];

    /**
     * Perform an implementation-specific calculation.
     *
     * @return mixed int|float
     */
    abstract public function calculate();

    /**
     * @param  array $weightings An array of weightings on which to perform a
     *                           calculation.
     * @return RiskFormula
     */
    public function setWeightings(array $weightings) : RiskFormula
    {
        $this->weightings = $weightings;

        return $this;
    }
}
