<?php

/**
 * This file contains the "FormAction" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace SDLT\Model;

use SilverStripe\Forms\FieldList;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use SilverStripe\ORM\DataObject;

/**
 * Class FormAction
 *
 * There are different types of action, and the CMS interface will be changed dynamically based on the type
 *
 * @property string Name
 * @property string Title
 * @property string Type
 * @property string Message
 *
 * @property FormTask Task
 * @property FormPage Goto
 * @property FormPage Page
 *
 */
class FormAction extends DataObject implements ScaffoldingProvider
{
    /**
     * @var string
     */
    private static $table_name = 'FormAction';

    /**
     * @var array
     */
    private static $db = [
        'Name' => 'Varchar(255)',
        'Type' => 'Enum(array("create_task", "continue", "goto", "message", "finish"))',
        'Message' => 'HTMLText'
    ];

    /**
     * @var array
     */
    private static $has_one = [
        'Task' => FormTask::class,
        'Goto' => FormPage::class,
        'Page' => FormPage::class
    ];

    /**
     * @var array
     */
    private static $summary_fields = [
        'Name',
        'Type',
        'ActionDescription'
    ];

    /**
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        $mainTab = $fields->findOrMakeTab('Root.Main');

        /** @noinspection PhpUndefinedMethodInspection */
        $mainTab->fieldByName('TaskID')->displayIf('Type')->isEqualTo('create_task');
        /** @noinspection PhpUndefinedMethodInspection */
        $mainTab->fieldByName('GotoID')->displayIf('Type')->isEqualTo('goto');
        /** @noinspection PhpUndefinedMethodInspection */
        $mainTab->fieldByName('Message')->displayIf('Type')->isEqualTo('message');

        return $fields;
    }

    /**
     * @param SchemaScaffolder $scaffolder Scaffolder
     * @return SchemaScaffolder
     */
    public function provideGraphQLScaffolding(SchemaScaffolder $scaffolder)
    {
        // Provide entity type
        $typeScaffolder = $scaffolder
            ->type(FormAction::class)
            ->addFields([
                'ID',
                'Name',
                'Type',
                'Message',
                'Task',
                'Goto',
            ]);

        return $scaffolder;
    }

    /**
     * @return string
     */
    public function getActionDescription()
    {
        switch ($this->Type) {
            case 'goto':
                $page = $this->Goto->exists() ? $this->Goto->Title : "Null";
                return "Goto: {$page}";
            case 'message':
                return "Message: {$this->Message}";
            case 'create_task':
                $task = $this->Task->exists() ? $this->Task->Title : "Null";
                return "Create Task: {$task}";
            case 'continue':
                return 'Continue';
            case 'finish':
                return 'Finish';
            default:
                return "Unknown";
        }
    }
}
