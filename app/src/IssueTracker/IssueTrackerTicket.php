<?php

/**
 * This file contains the "SecurityComponent" class.
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

/**
 * Implementers should model the format of their own ticketing system's issues.
 */
abstract class IssueTrackerTicket
{
    use Configurable;
    use Injectable;
    use Extensible;

    /**
     * @var array
     */
    protected $body = [];
    protected $listItemTexts = [];
    protected $listItems = [];

    /**
     * @var string
     */
    protected $projectKey = '';
    protected $title = '';
    protected $descriptionText = '';    // TODO: V2 only, move there
    protected $summaryText = '';
    protected $issueType = '';
    protected $introText = '';
    protected $headingText = '';
    protected $backgroundColour = '';   // TODO: V2 only, move there
    protected $email = '';

    /**
     * This does the meat of the formatting and composes a ticket in an appropriate
     * format.
     *
     * @return string
     */
    abstract public function compose() : string;

    /**
     * @param  string $projectKey
     * @return IssueTrackerTicket
     */
    public function setProjectKey(string $projectKey) : IssueTrackerTicket
    {
        $this->projectKey = $projectKey;

        return $this;
    }

    /**
     * @param  string $issueType
     * @return IssueTrackerTicket
     */
    public function setIssueType(string $issueType) : IssueTrackerTicket
    {
        $this->issueType = $issueType;

        return $this;
    }

    /**
     * @param  array   $listItems
     * @param  boolean $normalise
     * @return IssueTrackerTicket
     */
    public function setListItems(array $listItems, $normalise = false) : IssueTrackerTicket
    {
        if ($normalise === true) {
            foreach ($listItems as $listItem) {
                $name = array_shift($listItem);
                $desc = $listItem;
                $blocks = json_decode($this::normalise_list_item($name, ...$desc), true);

                // At first glance, this looks a little odd. But this is the way
                // that JIRA JSON in its v3 API is structured: 2 blocks at the same level,
                // representing the _same_ ticket/task line-item
                foreach ($blocks as $block) {
                    $this->listItems[] = $block;
                }
            }
        } else {
            $this->listItems = $listItems;
        }

        return $this;
    }

    /**
     * @param  string $text
     * @return IssueTrackerTicket
     */
    public function setHeadingText(string $text) : IssueTrackerTicket
    {
        $this->headingText = $text;

        return $this;
    }

    /**
     * @param  string $text
     * @return IssueTrackerTicket
     */
    public function setSummaryText(string $text) : IssueTrackerTicket
    {
        $this->summaryText = $text;

        return $this;
    }

    /**
     * @param  string $text
     * @return IssueTrackerTicket
     */
    public function setDescriptionText(string $text) : IssueTrackerTicket
    {
        $this->descriptionText = $text;

        return $this;
    }

    /**
     * @param  string $text
     * @return IssueTrackerTicket
     */
    public function setIntroText(string $text) : IssueTrackerTicket
    {
        $this->introText = $text;

        return $this;
    }

    /**
     * @param  string $code
     * @return IssueTrackerTicket
     */
    public function setBackgroundColour(string $code) : IssueTrackerTicket
    {
        $this->backgroundColour = $code;

        return $this;
    }

    /**
     * @param  string $email
     * @return IssueTrackerTicket
     */
    public function setEmail(string $email) : IssueTrackerTicket
    {
        $this->email = $email;

        return $this;
    }

    /**
     * @return array
     */
    abstract public function getIntro() : array;

    /**
     * @return array
     */
    abstract public function getHeading() : array;

    /**
     * @return array
     */
    abstract public function getListItems() : array;

    /**
     * @return array
     */
    abstract public function getDescription() : array;

    /**
     * @param  string $name The text to render before everything else on a line.
     * @param  array  $parts An arbitrary number of items to render into a list-item.
     * @return mixed  string
     */
    abstract public static function normalise_list_item($name, ...$parts) : string;

    /**
     * @return IssueTrackergetListItemsTicket
     * @throws \Exception
     */
    public static function factory() : IssueTrackerTicket
    {
        if (!$apiVersion = IssueTrackerTicket::config()->get('api_version')) {
            throw new \Exception('Please configure the SDLT with a valid api-version for your ticket system provider.');
        }

        if (!$provider = IssueTrackerSystem::config()->get('provider')) {
            throw new \Exception('Please configure the SDLT with a valid ticket system provider.');
        }

        $providerShort = @end(explode('\\', $provider));
        $ticketClass = sprintf('NZTA\SDLT\IssueTracker\%s\%sIssueV%d', $providerShort, $providerShort, $apiVersion);

        if (!class_exists($ticketClass)) {
            throw new \Exception(sprintf('No tracker ticket implementation called "%s" was found.', $ticketClass));
        }

        return $ticketClass::create();
    }
}
