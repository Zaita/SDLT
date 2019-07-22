<?php

/**
 * This file contains the "SDLTRiskCalc" trait.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright 2019 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Traits;

use NZTA\SDLT\Formulae\RiskFormula;

trait SDLTRiskCalc
{

    /**
     * Returns an instance of the appropriate {@link RiskFormula}.
     *
     * @return RiskFormula
     * @throws \Exception
     */
    public function riskFactory() : RiskFormula
    {
        if (!$this->isRiskType()) {
            throw new \Exception('Record is not a "Risk" type.');
        }

        $selectedFormula = sprintf('NZTA\SDLT\Formulae\%s', $this->RiskCalculation);

        if (!class_exists($selectedFormula)) {
            throw new \Exception(sprintf('Could not find formula: %s', $selectedFormula));
        }

        return $selectedFormula::create();
    }
}
