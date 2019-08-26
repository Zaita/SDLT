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
use SilverStripe\Forms\TextField;
use SilverStripe\Forms\TextareaField;
use SilverStripe\Forms\LiteralField;
use SilverStripe\Forms\NumericField;
use SilverStripe\ORM\FieldType\DBInt;
use SilverStripe\Forms\FieldGroup;
use SilverStripe\Forms\GridField\GridFieldDetailForm;

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
     * @var array
     */
    private static $many_many_extraFields = [
        'Controls' => [
            'Likelihood' => DBInt::class,
            'Impact' => DBInt::class,
            'LikelihoodPenalty' => DBInt::class,
            'ImpactPenalty' => DBInt::class,
        ]
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
            $list .= sprintf("\t* *(x) %s*\n\t\t%s\n", $control->Name, $control->Description);
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

    /**
     * get cms fields
     *
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();
        $instructions = LiteralField::create(
            'JIRAControlsChecklistMessage',
            sprintf(
                "<div class='warning message'>%s</div>",
                'Each of these controls is a line on a checklist generated on'
                .' the JIRA ticket. They will all be combined and shown as'
                .' "unchecked" with the Title followed by the description when'
                .' submitted to JIRA.'
            )
        );
        $name = TextField::create('Name')
            ->setDescription('This is the title of the component. It is'
            .' displayed on the component selection screen.');
        $description = TextareaField::create('Description')
            ->setDescription('This contains the instructions that appear inside'
            .' the panel at the top of the JIRA story.');

        $fields->addFieldsToTab('Root.Main', [$name, $description]);
        $fields->addFieldToTab('Root.Controls', $instructions);

        // Deal with many-many-extrafields
        $controlFields = singleton(SecurityControl::class)->getCMSFields();
        $controlFields->addFieldsToTab(
            'Root.Main',
            FieldGroup::create('Control Weights', (function() {
                $f = [];

                foreach (array_keys($this->config()->get('many_many_extraFields')['Controls']) as $fieldName) {
                    $f[] = NumericField::create(
                        sprintf('ManyMany[%s]', $fieldName),
                        NumericField::name_to_label($fieldName)
                    )
                        ->setAttribute('style', 'width: 100px;')
                        ->setMaxLength(strstr($fieldName, 'Penalty') ? 3 : 2);
                }

                return $f;
            })())
        );

        $fields->dataFieldByName('Controls')
            ->getConfig()
            ->getComponentByType(GridFieldDetailForm::class)
            ->setFields($controlFields);

        return $fields;
    }
}
