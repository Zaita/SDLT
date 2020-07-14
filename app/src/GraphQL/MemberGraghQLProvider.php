<?php
/**
 * This file contains the "MemberGraphQLProvider" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright NZ Transport Agency
 * @license BSD-3
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\GraphQL;

use Exception;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use GraphQL\Type\Definition\ResolveInfo;
use SilverStripe\Security\Member;
use SilverStripe\Security\Security;

/**
 * Class MemberGraphQLProvider
 */
class MemberGraphQLProvider implements ScaffoldingProvider
{
    /**
     * @param SchemaScaffolder $scaffolder Scaffolder
     * @return SchemaScaffolder
     */
    public function provideGraphQLScaffolding(SchemaScaffolder $scaffolder)
    {
        $scaffolder
            ->type(Member::class)
            ->addFields([
                'ID',
                'Email',
                'FirstName',
                'Surname',
                'IsSA',
                'IsCISO'
            ])
            ->operation(SchemaScaffolder::READ)
            ->setName('readCurrentMember')
            ->setUsePagination(false)
            ->setResolver(function ($object, array $args, $context, ResolveInfo $info) {
                $member = Security::getCurrentUser();

                // Check authentication
                if (!$member) {
                    throw new Exception('Please log in first...');
                }

                return Member::get()->filter('ID', $member->ID);
            })
            ->end();

        return $scaffolder;
    }
}
