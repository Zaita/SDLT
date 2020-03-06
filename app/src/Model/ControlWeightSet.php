<?php

/**
 * This file contains the "ControlWeightSet" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright NZ Transport Agency
 * @license BSD-3
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Model;

use SilverStripe\ORM\DataObject;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\DropdownField;

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


        $fields->removeByName([
            'RiskID',
            'SecurityComponentID',
            'SecurityControlID'
        ]);

        $componentID = $this->SecurityComponentID;

        if (!$componentID) {
            $componentID = $this->SecurityControl()->getParentComponentID();
        }

        $fields->addFieldsToTab(
            'Root.Main',
            [
                DropdownField::create(
                    'RiskID',
                    'Risk',
                    Risk::get()->sort('Name ASC')->map('ID', 'Name')
                )->setEmptyString(' '),
                DropdownField::create(
                    'SecurityComponentID',
                    'Security Component',
                    SecurityComponent::get()->sort('Name ASC')->map('ID', 'Name')
                )->setEmptyString(' '),
                DropdownField::create(
                    'SecurityControlID',
                    'Security Control',
                    SecurityControl::get()->sort('Name ASC')->map('ID', 'Name')
                )->setEmptyString(' ')
            ],
            'Likelihood'
        );

        if ($componentID) {
            $fields->dataFieldByName('SecurityComponentID')
            ->setValue($componentID)
            ->setDisabled(true);
        }

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

    /**
     * create/update control weight set from json import
     *
     * @param object $weights   control weights details
     * @param object $control   control details
     * @param object $component component details
     * @return void
     */
    public static function create_record_from_json($weights, $control, $component)
    {
        foreach ($weights as $weight) {
            $risk = Risk::find_or_make_by_name($weight->risk);
            $weightsDBObj = self::get_control_weight_set($risk->ID, $control->ID, $component->ID);

            if (empty($weightsDBObj)) {
                $weightsDBObj = self::create();
                $weightsDBObj->RiskID = $risk->ID;
                $weightsDBObj->SecurityControlID = $control->ID;
                $weightsDBObj->SecurityComponentID = $component->ID;
            }

            $weightsDBObj->Likelihood = $weight->likelihood ?? 0;
            $weightsDBObj->Impact = $weight->impact ?? 0;
            $weightsDBObj->LikelihoodPenalty = $weight->likelihoodPenalty ?? 0;
            $weightsDBObj->ImpactPenalty = $weight->impactPenalty ?? 0;

            $weightsDBObj->write();
        }
    }

    /**
     * get control weights set from db by risk, control, component id
     *
     * @param object $riskID      risk id
     * @param object $controlID   control id
     * @param object $componentID component id
     *
     * @return void
     */
    public static function get_control_weight_set($riskID, $controlID, $componentID)
    {
        $weightInDB = ControlWeightSet::get()
            ->filter([
                'RiskID' => $riskID,
                'SecurityControlID' => $controlID,
                'SecurityComponentID' => $componentID,
            ])
            ->first();

        return $weightInDB;
    }
}
