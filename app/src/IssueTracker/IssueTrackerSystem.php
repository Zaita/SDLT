<?php
/**
 * This file contains the "IssueTrackerSystem" abstract class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright NZ Transport Agency
 * @license BSD-3
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\IssueTracker;

use SilverStripe\Core\Config\Configurable;
use SilverStripe\Core\Injector\Injectable;
use SilverStripe\Core\Extensible;
use SilverStripe\ORM\DataObject;
use NZTA\SDLT\IssueTracker\IssueTrackerTicket;
use NZTA\SDLT\Model\SecurityComponent;

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
    abstract public function call(string $endpoint, string $data = '', string $method = 'POST') : string;

    /**
     * Adds a task to the JIRA board.
     *
     * @param string            $projectName   The name of the JIRA board to post issues to
     * @param string            $projectAspect
     * @param SecurityComponent $component     Each ticket represents a single SecurityComponent.
     * @throws \Exception                      When project name is not set
     * @return string                          A string to use as the "TicketLink" field
     *                                         in the {@link JiraTicket} model.
     */
    abstract public function addTask(string $projectName, SecurityComponent $component, string $issueType = 'Task', string $productAspect = '') : string;

    /**
     * Fetches remote statuses from objects represented as or within tickets.
     *
     * @param  DataObject $issue
     * @return void
     */

    /**
     * @return IssueTrackerTicket
     */
    public function issue() : IssueTrackerTicket
    {
        return IssueTrackerTicket::factory();
    }
}
