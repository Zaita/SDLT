<?php
/**
 * This file contains the "IssueTrackerSystem" abstract class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright 2019 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\IssueTracker;

use SilverStripe\Core\Config\Configurable;
use SilverStripe\Core\Injector\Injectable;
use SilverStripe\Core\Extensible;
use NZTA\SDLT\IssueTracker\IssueTrackerTicket;

/**
 * Abstract base class from which all ticket-systems extend.
 *
 * This class should be sub-classed by all ticket systems required for use by
 * the SDLT. This is part of an incremental improvement of the ticket-handling logic
 * which will eventually encompass a similar "TicketProvier" interface to be implemented
 * by e.g. {@link JIRA}.
 */
abstract class IssueTrackerSystem
{
    use Configurable;
    use Injectable;
    use Extensible;

    /**
     * @var string
     */
    private static $provider = '';

    /**
     * @var int
     */
    private static $api_version = '';

    /**
     * @param  string $endpoint  Web API endpoint.
     * @param  string $data      JSON-encoded data.
     * @return string
     */
    abstract public function call(string $endpoint, string $data) : string;

    /**
     * Adds a task to a ticket-system.
     *
     * @param  string $projectName The name of the board to post issues to.
     * @param  string $name        This shows at the title of the task.
     * @param  string $description This is the body of the task.
     * @param  string $issueType   The type of issue to write-to e.g. "Task" in JIRA.
     * @return string
     */
    abstract public function addTask(string $projectName, string $title, string $descr, IssueTrackerTicket $issue, string $issueType = 'Task', string $productAspect = '') : string;

    /**
     * @return IssueTrackerTicket
     */
    public function issue() : IssueTrackerTicket
    {
        return IssueTrackerTicket::factory();
    }
}
