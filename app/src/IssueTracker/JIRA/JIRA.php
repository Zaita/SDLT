<?php
/**
 * This file contains the "JIRA" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright 2019 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\IssueTracker\JIRA;

use GuzzleHttp\Client;
use NZTA\SDLT\IssueTracker\IssueTrackerSystem;
use NZTA\SDLT\IssueTracker\IssueTrackerTicket;

/**
 * JIRA class pushes new tasks to a JIRA project using the JIRA version 3 API.
 */
class JIRA extends IssueTrackerSystem
{
    /**
     * username, api_key, atlassian_instance, project_name are passed in with
     * Injector:
     *
     * ```
     * SilverStripe\Core\Injector\Injector:
     *  NZTA\SDLT\IssueTracker\JIRA\JIRA:
     *    properties:
     *      username: '`JIRA_USERNAME`'
     *      api_key: '`JIRA_API_KEY`'
     *      atlassian_instance: '`JIRA_ATLASSIAN_INSTANCE`'
     * ```
     *
     * Set the above constants in .env
     *
     * @param  string $endpoint  JIRA endpoint
     * @param  string $data      JSON-encoded data
     * @return string
     */
    public function call($endpoint, $data) : string
    {
        $client = new Client([
            'base_uri' => $this->atlassian_instance
        ]);
        $response = $client->request('POST', $endpoint, [
            'auth' => [
                $this->username,
                $this->api_key
            ],
            'body' => $data,
            'headers' => [
                'Accept'     => 'application/json',
                'Content-Type' => 'application/json',
            ]
        ]);

        return (string) $response->getBody();
    }

    /**
     * Adds a task to the JIRA board.
     *
     * @param string $projectName       The name of the JIRA board to post issues to
     * @param string $title             This shows at the title of the JIRA story
     * @param IssueTrackerTicket $issue This is the body of the JIRA story
     * @param string $issueType         Defaults to "Task". Other options unknown.
     * @throws \Exception               When project name is not set
     * @return string
     */
    public function addTask(string $projectName, string $title, string $descr, IssueTrackerTicket $issue, string $issueType = 'Task') : string
    {
        $projectName = strtoupper($projectName);
        $issue
                ->setSummaryText(sprintf('SDLT Controls - %s', $title))
                ->setProjectKey($projectName)
                ->setHeadingText($title)
                ->setDescriptionText($descr)
                ->setEmail($this->ticket_info_email)
                ->setIssueType($issueType);

        $baseUri = sprintf('/rest/api/%d/issue', $this->config()->get('api_version'));
        $body = $issue->compose();

        if ($result = $this->call($baseUri, $body)) {
            $json = json_decode($result);

            if (isset($json->key)) {
                return sprintf(
                    "%s/projects/%s/issues/%s",
                    $this->atlassian_instance,
                    $projectName,
                    $json->key
                );
            }
        }

        return '';
    }
}
