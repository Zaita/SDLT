<?php

/**
 * This file contains the "ControlWeightSet" class.
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

/**
 * This record allows multiple {@link Risk} records to be related to many
 * {@link SecurityControl} records, which results in a unique combination of
 * {@link SecurityComponent} to {@link SecurityControl} with a "set" comprising one
 * or more {@link Risk} + ratings and threshold data.
 *
 * Traditionally you'd use a ManyManyThrough, but as of 4.3.0, it doesn't work in
 * a {@link GridField} context as you might imagine a many_many_extraFields to work.
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

    /**
     * @var array
     */
    private static $has_one = [
        'Risk' => Risk::class,
        'SecurityControl' => SecurityControl::class,
        'SecurityComponent' => SecurityComponent::class,
    ];

    /**
     * @var array
     */
    private static $summary_fields = [
        'Risk.Name' => 'Risk',
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
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();
        $componentID = $this->SecurityComponentID || $this->SecurityControl()->getParentComponentID();

        $fields->dataFieldByName('SecurityComponentID')
            ->setValue($componentID)
            ->setDisabled(true);

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

        if (!$this->ID && !$this->SecurityComponentID) {
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

        if (strlen($this->Likelihood) && ($this->Likelihood <0 || $this->Likelihood >10)) {
            $result->addError('Likelihood should be a value between 0 and 10.');
        }

        if (strlen($this->Impact) && ($this->Impact <0 || $this->Impact >10)) {
            $result->addError('Impact should be a value between 0 and 10.');
        }

        if (strlen($this->LikelihoodPenalty) && ($this->LikelihoodPenalty <0 || $this->LikelihoodPenalty >100)) {
            $result->addError('Likelihood Penalty should be a value between 0 and 100.');
        }

        if (strlen($this->ImpactPenalty) && ($this->ImpactPenalty <0 || $this->ImpactPenalty >100)) {
            $result->addError('Impact Penalty should be a value between 0 and 100.');
        }

        if (!$this->RiskID) {
            $result->addError('Please select a Risk for this Control.');
        }

        if (!$this->SecurityComponentID) {
            $this->SecurityComponentID = $this->SecurityControl()->getParentComponentID();
        }

        $controlRisks = self::get()
            ->filter([
                'SecurityControlID' => $this->SecurityControlID,
                'RiskID' => $this->RiskID,
                'SecurityComponentID' => $this->SecurityComponentID,
            ])->exclude('ID', $this->ID);

        if ($controlRisks->count()) {
            $result->addError('Please select a unique Risk for this Control.');
        }

        return $result;
    }
}
