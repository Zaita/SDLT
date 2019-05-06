<?php

/**
 * This file contains the "Pillar" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Model;

use SilverStripe\ORM\DataObject;
use SilverStripe\Forms\DropdownField;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use SilverStripe\Security\Member;
use SilverStripe\Security\Security;
use Symbiote\GridFieldExtensions\GridFieldOrderableRows;
use SilverStripe\Forms\GridField\GridFieldPaginator;

/**
 * Class Dashboard
 *
 * @property string Title
 * @property string Subtitle
 *
 * @method Pillars Pillars()
 * @method Tasks Tasks()
 */
class Dashboard extends DataObject implements ScaffoldingProvider
{
    /**
     * @var string
     */
    private static $table_name = 'Dashboard';

    /**
     * @var array
     */
    private static $db = [
        'Title' => 'Varchar(255)',
        'Subtitle' => 'Varchar(255)'
    ];

    /**
     * @var array
     */
    private static $has_many = [
        'Pillars' => Pillar::class
    ];

    /**
     * @var array
     */
    private static $many_many = [
        'Tasks' => Task::class
    ];

    /**
     * @var array
     */
    private static $summary_fields = [
        'Title',
        'Subtitle'
    ];


    /**
     * CMS Fields
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        $pillars = $fields->dataFieldByName('Pillars');
        if ($pillars) {
            $config = $pillars->getConfig();

            $config->addComponent(
                new GridFieldOrderableRows('SortOrder')
            );

            $pageConfig = $config->getComponentByType(GridFieldPaginator::class);
            $pageConfig->setItemsPerPage(250);
        }

        return $fields;
    }

    /**
     * @param SchemaScaffolder $scaffolder Scaffolder
     * @return SchemaScaffolder
     */
    public function provideGraphQLScaffolding(SchemaScaffolder $scaffolder)
    {
        // Provide entity type
        $dashboardScaffolder = $scaffolder
            ->type(Dashboard::class)
            ->addFields([
                'ID',
                'Title',
                'Subtitle'
            ]);

        // Provide relations
        $dashboardScaffolder
            ->nestedQuery('Pillars')
            ->setUsePagination(false)
            ->end();

        $dashboardScaffolder
            ->nestedQuery('Tasks')
            ->setUsePagination(false)
            ->end();

        $dashboardScaffolder
            ->operation(SchemaScaffolder::READ)
            ->setName('readDashboard')
            ->setUsePagination(false)
            ->end();

        return $scaffolder;
    }

    /**
     * Allow logged-in user to access the model
     *
     * @param Member|null $member passed in by framework
     * @return bool
     */
    public function canView($member = null)
    {
        return (Security::getCurrentUser() !== null);
    }
}
