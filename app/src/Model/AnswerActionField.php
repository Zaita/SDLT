<?php

/**
 * This file contains the "AnswerActionField" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright NZ Transport Agency
 * @license BSD-3
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Model;

use SilverStripe\Forms\DropdownField;
use SilverStripe\Forms\FieldList;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use SilverStripe\ORM\DataObject;
use SilverStripe\Core\Convert;
use SilverStripe\Security\Member;
use SilverStripe\Security\Security;
use Symbiote\GridFieldExtensions\GridFieldOrderableRows;
use NZTA\SDLT\Traits\SDLTModelPermissions;

/**
 * Class AnswerActionField
 *
 * There are different types of action, and the CMS interface will be changed dynamically based on the type
 *
 * @property string Label
 * @property string Title
 * @property string Type
 * @property string Message
 *
 * @property Task Task
 * @property Question Goto
 * @property Question Question
 *
 * @method Question Goto()
 * @method Question Question()
 */
class AnswerActionField extends DataObject implements ScaffoldingProvider
{
    use SDLTModelPermissions;
    /**
     * @var string
     */
    private static $table_name = 'AnswerActionField';

    /**
     * @var array
     */
    private static $db = [
        'Label' => 'Varchar(255)',
        'ActionType' => 'Enum(array("continue", "goto", "message", "finish"))',
        'Message' => 'HTMLText',
        'SortOrder' => 'Int',
        'Result' => 'Varchar(255)',
        'IsApprovalForTaskRequired' => 'Boolean', // only when task's action
    ];

    /**
     * @var array
     */
    private static $has_one = [
        'Goto' => Question::class, // if action type goto select
        'Question' => Question::class // question has many actions
    ];

    /**
     * @var array
     */
    private static $summary_fields = [
        'Label',
        'ActionType',
        'ActionDescription' => "Action Description",
        'TaskNames' => 'Tasks'
    ];

    /**
     * @var array
     */
    private static $many_many = [
        'Tasks' => Task::class,
    ];

    /**
     * @var array
     */
    private static $field_labels = [
        'Label' => 'Action Label'
    ];

    /**
     * @var string
     */
    private static $default_sort = 'SortOrder';

    /**
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        //remove has_one relationship field:QuestionID and SortOrder
        $fields->removeByName(['QuestionID', 'SortOrder']);

        //Questions are used on both Task and Questionnaire: we don't know which
        //one this action field applies to, so we need to merge the sets of both
        //in rare cases, the question may be used on both a Questionnaire and a
        //task
        $questionList =
            $this->Question()->Task()->Questions()->map()->toArray()
            +
            $this->Question()->Questionnaire()->Questions()->map()->toArray();

        $fields
            ->dataFieldByName('Result')
            ->setDescription('The result will be used only if Questionnaire type is a task.');

        $fields->addFieldsToTab(
            'Root.Main',
            [
                DropdownField::create('GotoID', 'Go to', $questionList),
            ]
        );

        /** @noinspection PhpUndefinedMethodInspection */
        $fields->dataFieldByName('GotoID')->displayIf('ActionType')->isEqualTo('goto');

        /** @noinspection PhpUndefinedMethodInspection */
        $fields->dataFieldByName('Message')->displayIf('ActionType')->isEqualTo('message');

        /** @noinspection PhpUndefinedMethodInspection */
        $fields->dataFieldByName('Result')->displayIf('ActionType')->isEqualTo('finish');

        if ($this->Question()->Questionnaire()->exists()) {
            $fields->removeByName('IsApprovalForTaskRequired');
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
        $typeScaffolder = $scaffolder
            ->type(AnswerActionField::class)
            ->addFields([
                'ID',
                'Label',
                'ActionType',
                'Message',
                'Goto',
            ]);

        return $scaffolder;
    }

    /**
     * @return string
     */
    public function getActionDescription()
    {
        switch ($this->ActionType) {
            case 'goto':
                $question = $this->Goto->exists() ? $this->Goto->Title : "Null";
                return "Goto: {$question}";
            case 'message':
                return "Message: " . Convert::xml2raw($this->Message);
            case 'continue':
                return 'Continue';
            case 'finish':
                return 'Finish';
            default:
                return "Unknown";
        }
    }

    /**
     * validate the Approval Group based on the IsApprovalForTaskRequired flag
     *
     * @return ValidationResult
     */
    public function validate()
    {
        $result = parent::validate();

        if ($this->IsApprovalForTaskRequired && $this->Question()->Task()->exists() &&
            !$this->Question()->Task()->ApprovalGroup()->exists()) {
            $result->addError('Please first select an approval group on the task level.');
        }

        return $result;
    }

    /**
     * get task name
     *
     * @return string
     */
    public function getTaskNames()
    {
        return $this->Tasks() ? implode(", ", $this->Tasks()->column('Name')) : '';
    }

    /**
     * create action field from json import
     *
     * @param object $actionFieldJson input field json object
     * @return DataObject
     */
    public static function create_record_from_json($actionFieldJson)
    {
        $obj = self::create();

        $obj->Label = $actionFieldJson->label;
        $obj->ActionType = $actionFieldJson->actionType ?? 'continue';
        $obj->Message = $actionFieldJson->message ?? '';
        $obj->Result = $actionFieldJson->result ?? '';
        $obj->IsApprovalForTaskRequired = $actionFieldJson->isApprovalForTaskRequired ?? false;

        // add task with action
        if (property_exists($actionFieldJson, "tasks") && !empty($tasks = $actionFieldJson->tasks)) {
            foreach ($tasks as $task) {
                $dbTask = Task::find_or_make_by_name($task->name);
                $obj->Tasks()->add($dbTask);
            }
        }

        $obj->write();

        return $obj;
    }
}
