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

use SDLT\Model\Questionnaire;
use SDLT\Page\HomePage;
use SilverStripe\ORM\DataObject;

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
        'Disabled' => 'Boolean'
    ];

    /**
     * @var array
     */
    private static $has_one = [
        'HomePage' => HomePage::class,
        'Questionnaire' => Questionnaire::class,
    ];
}
