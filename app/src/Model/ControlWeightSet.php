<?php

/**
 * This file contains the " SecurityControl Risk and Weight" class.
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
use SilverStripe\Security\Security;
use NZTA\SDLT\Model\MultiChoiceAnswerSelection;
use SilverStripe\Forms\FieldList;

/**
 * Add a unique Risk for control
 */
class ControlWeightSet extends DataObject
{
    /**
     * @var string
     */
    private static $table_name = 'ControlWeightSet';

    /**
     * @var array
     */
    private static $db = [
        'Likelihood' => 'Int',
        'Impact' => 'Int',
        'LikelihoodPenalty' => 'Int',
        'ImpactPenalty' => 'Int',
    ];

    private static $has_one = [
        'Risk' => Risk::class,
        'SecurityControl' => SecurityControl::class,
        'SecurityComponent' => SecurityComponent::class,
    ];

    /**
     * @var array
     */
    private static $summary_fields = [
        'Risk.Name' => 'Risk'
    ];

    /**
     * @var array
     */
    private static $searchable_fields = [
        'Risk.Name',
        'SecurityControl.Name',
        'SecurityComponent.Name',
    ];

    /**
     * get cms fields
     *
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        if (($componentID = $this->SecurityComponentID) ||
            ($componentID = $this->SecurityControl()->getParentComponentID())) {
            $fields->dataFieldByName('SecurityComponentID')
            ->setValue($componentID)
            ->setDisabled(true);
        }

        if ($this->SecurityControlID) {
            $fields->dataFieldByName('SecurityControlID')->setDisabled(true);
        }

        $fields->addFieldsToTab(
            'Root.Main',
            [
                $fields->dataFieldByName('RiskID'),
                $fields->dataFieldByName('SecurityComponentID'),
                $fields->dataFieldByName('SecurityControlID'),
            ],
            'Likelihood'
        );

        return $fields;
    }

    /**
     * Event handler called before writing to the database.
     *
     * @return void
     */
    public function onBeforeWrite()
    {
        parent::onBeforeWrite();

        if (!$this->ID) {
            $this->SecurityComponentID = $this->SecurityControl()
                ->getParentComponentID();
        }
    }

    /**
     * @return ValidationResult
     */
    public function validate()
    {
        $result = parent::validate();

        if (strlen($this->Likelihood) && $this->Likelihood >10) {
            $result->addError('Likelihood cannot be greater than 10.');
        }

        if (strlen($this->Impact) && $this->Impact >10) {
            $result->addError('Impact cannot be greater than 10.');
        }

        if (strlen($this->LikelihoodPenalty) && $this->LikelihoodPenalty >100) {
            $result->addError('Likelihood Penalty cannot be greater than 100.');
        }

        if (strlen($this->ImpactPenalty) && $this->ImpactPenalty >100) {
            $result->addError('Impact Penalty cannot be greater than 100.');
        }

        if (!$this->RiskID) {
            $result->addError('Please select the Risk for the control.');
        }

        if ($this->RiskID) {
            $controlRisks = self::get()
              ->filter([
                  'SecurityControlID' => $this->SecurityControlID,
                  'RiskID' => $this->RiskID,
                  'SecurityComponentID' => $this->SecurityComponentID,
              ])->exclude('ID', $this->ID);

            if ($controlRisks->count()) {
                $result->addError('Please select a unique Risk for the control.');
            }
        }

        return $result;
    }
}
