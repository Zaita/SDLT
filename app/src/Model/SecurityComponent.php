<?php

/**
 * This file contains the "SecurityComponent" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Model;

use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\HasManyList;
use SilverStripe\Security\Member;
use SilverStripe\Security\Security;

/**
 * Class SecurityComponent
 *
 * @property string Name
 * @property string Description
 * @method HasManyList Controls()
 */
class SecurityComponent extends DataObject implements ScaffoldingProvider
{
    /**
     * @var string
     */
    private static $table_name = 'SecurityComponent';

    /**
     * @var array
     */
    private static $db = [
        'Name' => 'Varchar(255)',
        'Description' => 'Text',
    ];

    /**
     * @var array
     */
    private static $many_many = [
        'Controls' => SecurityControl::class,
    ];

    /**
     * @param SchemaScaffolder $scaffolder The scaffolder
     * @return SchemaScaffolder
     */
    public function provideGraphQLScaffolding(SchemaScaffolder $scaffolder)
    {
        $typeScaffolder = $scaffolder
            ->type(self::class)
            ->addFields([
                'ID',
                'Name',
                'Description',
            ]);

        $typeScaffolder
            ->operation(SchemaScaffolder::READ)
            ->setName('readSecurityComponents')
            ->setUsePagination(false)
            ->end();
    }

    /**
     * Allow logged-in user to access the model
     *
     * @param Member|null $member The member
     * @return bool
     */
    public function canView($member = null)
    {
        return (Security::getCurrentUser() !== null);
    }

    /**
     * Generate a checklist of security controls in JIRA format
     *
     * @return string
     */
    public function getChecklist()
    {
        $controls = $this->Controls();
        $list = '';
        foreach ($controls as $control) {
            $intro =
            $list .= sprintf("\t* *(/) %s*\n\t\t%s\n", $control->Name, $control->Description);
        }
        return $list;
    }

    /**
     * Generate a JIRA instruction panel with a title and background colour
     *
     * @param string $introTitle defaults to 'Instruction'
     * @param string $bgColor    hexadecimal RGB colour, defaults to FFFFCE
     * @return string
     */
    public function getIntro($introTitle = 'Instruction', $bgColor = "FFFFCE")
    {

        return sprintf(
            "{panel:title=(on) %s|bgColor=#%s}%s{panel}\t\n*%s*\n",
            $introTitle,
            $bgColor,
            $this->Description,
            $this->Name
        );
    }

    /**
     * Generate an instruction panel followed by a checklist
     *
     * @return string
     */
    public function getJIRABody()
    {
        return $this->getIntro() . $this->getChecklist();
    }
}
