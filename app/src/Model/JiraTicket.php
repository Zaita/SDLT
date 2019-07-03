<?php

/**
 * This file contains the "JiraTicket" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Model;

use Exception;
use GraphQL\Type\Definition\ResolveInfo;
use SilverStripe\Core\Convert;
use SilverStripe\GraphQL\OperationResolver;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use SilverStripe\ORM\DataObject;
use NZTA\SDLT\Helper\JIRA;

/**
 * Class JiraTicket
 *
 * @property string TicketLink
 * @property string JiraKey
 * @property TaskSubmission TaskSubmission
 */
class JiraTicket extends DataObject implements ScaffoldingProvider
{
    /**
     * @var string
     */
    private static $table_name = 'JiraTicket';

    /**
     * @var array
     */
    private static $db = [
        'TicketLink' => 'Text',
        'JiraKey' => 'Varchar(255)'
    ];

    /**
     * @var array
     */
    private static $has_one = [
        'TaskSubmission' => TaskSubmission::class
    ];

    /**
     * @var array
     */
    private static $summary_fields = [
        'JiraKey' => 'JIRA Board',
        'TicketLink' => 'Link to ticket'
    ];

    /**
     * @param SchemaScaffolder $scaffolder The scaffolder of the schema
     *
     * @return void
     */
    public function provideGraphQLScaffolding(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->type(JiraTicket::class)
            ->addFields([
                'ID',
                'JiraKey',
                'TicketLink',
            ]);

        $scaffolder
            ->mutation('createJiraTicket', JiraTicket::class)
            ->addArgs([
                'ComponentID' => 'ID!',
                'JiraKey' => 'String!',
            ])
            ->setResolver(new class implements OperationResolver
            {
                /**
                 * Invoked by the Executor class to resolve this mutation / query
                 * @param mixed       $object  object
                 * @param array       $args    args
                 * @param mixed       $context context
                 * @param ResolveInfo $info    info
                 * @return mixed
                 * @see Executor
                 * @throws Exception
                 */
                public function resolve($object, array $args, $context, ResolveInfo $info)
                {
                    $componentID = Convert::raw2sql($args['ComponentID']);
                    $component = SecurityComponent::get_by_id($componentID);
                    if (!$component) {
                        throw new Exception("Can not find component with ID: {$componentID}");
                    }

                    $jiraTicket = JiraTicket::create();
                    $jiraTicket->JiraKey = Convert::raw2sql($args['JiraKey']);
                    $link = JIRA::create()->addTask(
                        $jiraTicket->JiraKey,
                        $component->Name,
                        $component->getJIRABody()
                    );
                    $jiraTicket->TicketLink = $link;
                    $jiraTicket->write();


                    return $jiraTicket;
                }
            })
            ->end();
    }
}
