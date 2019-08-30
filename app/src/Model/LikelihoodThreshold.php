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

/**
 * Class LikelihoodThreshold. Represents an admin-managed record for calculation
 * of Likelihood Ratings.
 */
class LikelihoodThreshold extends DataObject
{
    /**
     * @var array
     */
    private static $has_one = [
        'Task' => Task::class,
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
                'cannot be less than or equal to zero, or exceed 100.'
            );
        }

        return $result;
    }
}
