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
use SilverStripe\Security\Member;
use SilverStripe\Security\Security;

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
        'DisplayOnHomePage'=> 'Boolean'
    ];

      /**
     * @var array
     */
    private static $has_one = [
        'Questionnaire' => Questionnaire::class,
    ];

    /**
     * Allow logged-in user to access the model
     *
     * @param Member|null $member
     * @return bool
     */
    public function canView($member = null)
    {
        return (Security::getCurrentUser() !== null);
    }
}
