<?php

/**
 * This file contains the "Task" class.
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
 * Class Task
 *
 */
class Task extends DataObject
{
    /**
     * @var string
     */
    private static $table_name = 'Task';

    /**
     * @var array
     */
    private static $db = [
        'Name' => 'Varchar(255)',
    ];
}
