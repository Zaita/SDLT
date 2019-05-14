<?php
/**
 * This file contains the "JIRA" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright 2019 Catalyst.Net Ltd
 * @license https://nzta.govt.nz (BSD-3)
 * @link https://nzta.govt.nz
 */

namespace NZTA\SDLT\Helper;

use SilverStripe\Core\Config\Configurable;
use SilverStripe\Core\Injector\Injectable;
use SilverStripe\Core\Extensible;
use GuzzleHttp\Client;

/**
 * JIRA class pushes new tasks to a JIRA project
 */
class JIRA
{
    use Configurable;
    use Injectable;
    use Extensible;

    /**
     * username, api_key, atlassian_instance, project_name are passed in with
     * Injector:
     * ```
     * SilverStripe\Core\Injector\Injector:
     *  NZTA\SDLT\Helper\JIRA:
     *    properties:
     *      username: '`JIRA_USERNAME`'
     *      api_key: '`JIRA_API_KEY`'
     *      atlassian_instance: '`JIRA_ATLASSIAN_INSTANCE`'
     * ```
     *
     * Set these constants in .env
     * @param string $endpoint JIRA endpoint
     * @param string $data     json_encode'd data
     *
     * @return null probably
     */
    public function call($endpoint, $data)
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

        $result = (string) $response->getBody();
        if ($result) {
            return $result;
        }

        return null;
    }

    /**
     * Adds a task to the JIRA board
     *
     * @param string $projectName name of the JIRA board to post issues to
     * @param string $name        This shows at the title of the JIRA story
     * @param string $description This is the body of the JIRA story
     * @param string $issueType   defaults to Task, other options unknown
     * @throws \Exception when project name is not set
     * @return Client
     */
    public function addTask($projectName, $name, $description, $issueType = 'Task')
    {
        $projectName = strtoupper($projectName);
        $data['fields'] = [
            'project' => [
                'key' => $projectName
            ],
            'summary' => $name,
            'description' => $description,
            'issuetype' => [
                'name' => $issueType
            ]
        ];

        $body = json_encode($data);

        if ($result = $this->call('/rest/api/2/issue', $body)) {
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
    }
}
