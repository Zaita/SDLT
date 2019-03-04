<?php

/**
 * This file contains the "Pillar" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Model;

use NZTA\SDLT\Page\HomePage;
use SilverStripe\ORM\DataObject;
use SilverStripe\Forms\DropdownField;

/**
 * Class Pillar
 *
 * @property string Label
 *
 * @method HomePage HomePage()
 * @method Questionnaire Questionnaire()
 *
 * // TODO: We need to allow Pillar to target at QuestionnaireGroup (e.g, Product, Project or Solution)
 */
class Pillar extends DataObject
{
    /**
     * @var string
     */
    private static $table_name = 'Pillar';

    /**
     * @var array
     */
    private static $db = [
        'Label' => 'Varchar(255)',
        'Disabled' => 'Boolean',
        'Type' => 'Varchar(255)'
    ];

    /**
     * @var array
     */
    private static $has_one = [
        'HomePage' => HomePage::class,
    ];

    /**
     * @var array
     */
    private static $has_many = [
        'Questionnaire' => Questionnaire::class,
    ];

      /**
     * @var array
     */
    private static $summary_fields = [
        'Label'
    ];

    /**
     * @var array
     */
    private static $pillar_type = [
        'proof_of_concept' => 'PROOF OF CONCEPT OR SOFTWARE TRIAL',
        'software_as_service' => 'SOFTWARE AS A SERVICE (SAAS)',
        'product_project_or_solution' => 'PRODUCT, PROJECT OR SOLUTION',
        'feature_or_bug_fix' => 'FEATURE OR BUG FIX'
    ];

    /**
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        $fields->addFieldToTab(
            'Root.Main',
            DropdownField::create(
                'Type',
                'Pillar Type',
                self::$pillar_type
            )->setDescription('The selected value will be used to dispaly icon
                in the front-end for the Pillar.')
        );

        return $fields;
    }
}
