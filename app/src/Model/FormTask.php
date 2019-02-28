<?php

/**
 * This file contains the "FormTask" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Model;

use SilverStripe\ORM\DataObject;

/**
 * Class FormTask
 *
 */
class FormTask extends DataObject
{
    /**
     * @var string
     */
    private static $table_name = 'FormTask';

    /**
     * @var array
     */
    private static $db = [
        'Name' => 'Varchar(255)',
    ];
}
