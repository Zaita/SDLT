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

use GraphQL\Type\Definition\ResolveInfo;
use NZTA\SDLT\GraphQL\GraphQLAuthFailure;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ResolverInterface;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use SilverStripe\ORM\DataObject;

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
            ->setResolver(new class implements ResolverInterface
            {
                /**
                 * Invoked by the Executor class to resolve this mutation / query
                 * @param mixed $object object
                 * @param array $args args
                 * @param mixed $context context
                 * @param ResolveInfo $info info
                 * @return mixed
                 * @throws GraphQLAuthFailure
                 * @see Executor
                 *
                 */
                public function resolve($object, array $args, $context, ResolveInfo $info)
                {
                    // TODO: Write the logic seriously
                    $component = SecurityComponent::get_by_id($args['ComponentID']);

                    $jiraTicket = JiraTicket::create();
                    $jiraTicket->TicketLink = "https://catalyst.net.nz/{$component->Name}";
                    $jiraTicket->JiraKey = $args['JiraKey'];
                    $jiraTicket->write();

                    return $jiraTicket;
                }
            })
            ->end();
    }
}
