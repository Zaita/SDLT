<?php

/**
 * This file contains the "Risk" class.
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
use SilverStripe\Forms\GridField\GridFieldDataColumns;
use SilverStripe\Forms\GridField\GridFieldAddExistingAutocompleter;

/**
 * A "Risk" can be associated with a "Risk Questionnaire" and is used to calculate
 * a "Base Impact Rating".
 */
class Risk extends DataObject
{
    /**
     * @var array
     */
    private static $db = [
        'Name' => 'Varchar(255)',
        'Description' => 'Text',
    ];

    /**
     * @var array
     */
    private static $belongs_many_many = [
        'AnswerSelections' => MultiChoiceAnswerSelection::class
    ];

    /**
     * @var array
     */
    private static $has_many = [
        'ControlWeightSets' => ControlWeightSet::class
    ];

    /**
     * @var array
     */
    private static $summary_fields = [
        'Name',
        'Created',
        'LastEdited',
    ];

    /**
     * @var array
     */
    private static $searchable_fields = [
        'Name',
        'Description',
    ];

    /**
     * Used by {@link QuestionnaireAdmin} and others.
     *
     * @var array
     */
    private static $extra_export_fields = [
        'Description',
    ];

    /**
     * @var string
     */
    private static $table_name = 'Risk';

    /**
     * Whether or not to enable {@link GridFieldImportButton} in this model's
     * admin view.
     *
     * @var boolean
     */
    private static $show_import_button = true;

    /**
     * Whether or not to enable {@link GridFieldExportButton} in this model's
     * admin view.
     *
     * @var boolean
     */
    private static $show_export_button = true;

    /**
     * Allow logged-in users have access to this model
     *
     * @param Member|null $member passed in by framework
     * @return bool
     */
    public function canView($member = null)
    {
        return (Security::getCurrentUser() !== null);
    }

    /**
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        $fields->removeByName('ControlWeightSets');

        return $fields;
    }

    /**
     * @return ValidationResult
     */
    public function validate()
    {
        $result = parent::validate();

        if (strlen($this->Weight) && $this->Weight < 0) {
            $result->addError('Weight values should be >= 0.');
        }

        return $result;
    }

    /**
     * find or create a new risk from the given name string
     *
     * @param string $name name of the risk
     * @return DataObject
     */
    public static function find_or_make_by_name($name)
    {
        $riskInDB = self::get()->filter([
            'Name' => $name
        ])->first();

        // if risk doesn't exist with the given name then create one.
        if (empty($riskInDB)) {
            $newRisk = self::create();
            $newRisk->Name = $name;
            $riskInDB = $newRisk->write();
        }

        return $riskInDB;
    }
}
