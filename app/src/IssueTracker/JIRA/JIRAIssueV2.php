<?php

/**
 * This file contains the "JIRAIssueV2" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright 2019 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\IssueTracker\JIRA;

use NZTA\SDLT\IssueTracker\IssueTrackerTicket;

/**
 * A very basic encapsulation of a v2 JIRA issue format.
 */
class JIRAIssueV2 extends IssueTrackerTicket
{
    /**
     * @var string
     */
    protected $introText = 'Instruction';
    protected $backgroundColour = 'FFFFCE';

    /**
     * Simple v2 ticket format.
     *
     * @return string
     */
    public function compose() : string
    {
        $payload = [
            'fields' => [
                'project' => [
                    'key' => $this->projectKey,
                ],
                'summary' => $this->summaryText,
                'description' => $this->descriptionText,
                'issuetype' => [
                    'name' => $this->issueType
                ]
            ]
        ];

        return json_encode($payload);
    }

    /**
     * Defines an issue's list-items.
     *
     * @todo Should they be rendered in any particular way in JIRA e.g. "[x]"?
     * @return array
     */
    public function getListItems() : array
    {
        return preg_split("#\n#", $this->description);
    }

    /**
     * Defines an issue's heading.
     *
     * @todo Should they be rendered in any particular way in JIRA e.g. "[x]"?
     * @return array
     */
    public function getHeading() : array
    {
        return [$this->title];
    }

    /**
     * Defines an issue's heading.
     *
     * @todo Should they be rendered in any particular way in JIRA e.g. "[x]"?
     * @return array
     */
    public function getDescription() : array
    {
        return [$this->descriptionText];
    }

    /**
     * Defines an issue's introductory text.
     *
     * @todo Should they be rendered in any particular way in JIRA e.g. "[x]"?
     * @return array
     */
    public function getIntro() : array
    {
        return [$this->introText];
    }

    /**
     * @param  string $name  The text to render before everything else on a line.
     * @param  string $parts One or more arbitrary params as strings to render
     *                       into a list-item.
     * @return mixed  string
     * @throws InvalidArgumentException
     */
    public static function normalise_list_item($name, ...$parts) : string
    {
        foreach ($parts as $part) {
            if (!is_string($part)) {
                throw new \InvalidArgumentException('Bad variadic parameter passed.');
            }
        }

        $desc = implode(' ', $parts);

        return sprintf("\t* *(x) %s*\n\t\t%s\n", $name, $desc);
    }
}
