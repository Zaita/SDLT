<?php

/**
 * This file contains the "MockIssueTracker" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright 2019 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Test;

use SilverStripe\Dev\TestOnly;
use NZTA\SDLT\IssueTracker\IssueTrackerSystem;
use NZTA\SDLT\Model\SecurityComponent;
use SilverStripe\ORM\DataObject;

class MockIssueTracker extends IssueTrackerSystem implements TestOnly
{
    public function call(string $endpoint, string $data) : string
    {
        return '';
    }

    public function addTask(string $projectName, SecurityComponent $component, string $issueType = 'Task', string $productAspect = '') : string
    {
        return '';
    }

    public function getControlDetailsFromJiraTicket(DataObject $issue) : void
    {
    }

    public function getIntro(string $introTitle, string $bgColor) : string
    {
        return '';
    }

    public static function normalise_checklist_item(string $name, string $desc) : string
    {
        return '';
    }
}
