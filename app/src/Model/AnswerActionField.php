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
use SilverStripe\Forms\NumericField;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use SilverStripe\ORM\DataObject;
use SilverStripe\Core\Convert;
use SilverStripe\Security\Member;
use SilverStripe\Security\Security;
use Symbiote\GridFieldExtensions\GridFieldOrderableRows;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridFieldConfig_RelationEditor;
use SilverStripe\Forms\GridField\GridFieldEditButton;
use Symbiote\GridFieldExtensions\GridFieldEditableColumns;
use NZTA\SDLT\Traits\SDLTModelPermissions;
use SilverStripe\ORM\FieldType\DBInt;

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
        'TaskNames' => 'Tasks',
        'Risks.Count' => 'No. Risks & Weights'
    ];

    /**
     * @var array
     */
    private static $many_many = [
        'Tasks' => Task::class,
        'Risks' => Risk::class
    ];

    /**
     * @var array
     */
    private static $many_many_extraFields = [
        'Risks' => [
            'Weight' => DBInt::class,
        ]
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

        //remove has_one relationship field:QuestionID, SortOrder and Risks
        $fields->removeByName([
            'QuestionID',
            'SortOrder',
            'Risks'
        ]);

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

        if ($this->isRiskType()) {
            // Allow inline-editing for the "Weight" value
            $componentEditableFields = (new GridFieldEditableColumns())
                ->setDisplayFields(
                    [
                        'Weight' => [
                            'title' => 'Weighting',
                            'field' => NumericField::create('ManyMany[Weight]')
                        ]
                    ]
                );

            // No need for an edit button. The weight is the only editable field
            $config = GridFieldConfig_RelationEditor::create()
                    ->addComponent($componentEditableFields, GridFieldEditButton::class);

            $fields->addFieldToTab(
                'Root.Main',
                GridField::create(
                    'Risks',
                    'Risk Associations',
                    $this->Risks(),
                    $config
                )
            );
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
     * @param object $actionFieldJson action field json object
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
        // if risk exist then add many_many relationship and extra field weight with action
        if (property_exists($actionFieldJson, "risks") && !empty($risks = $actionFieldJson->risks)) {
            foreach ($risks as $risk) {
                $dbRisk = Risk::find_or_make_by_name(trim($risk->name));
                $obj->Risks()->add($dbRisk, ['Weight' => $risk->weight]);
            }
        }

        $obj->write();

        return $obj;
    }

    /**
     * export actionField
     *
     * @param object $actionField actionField
     * @return array
     */
    public static function export_record($actionField)
    {
        $obj['label'] = $actionField->Label ?? '';
        $obj['actionType'] =  $actionField->ActionType;

        if ($actionField->ActionType == 'goto') {
            $obj['gotoQuestionTitle'] = $actionField->Goto() ? $actionField->Goto()->Title: '';
        }

        // export associate risks
        $risks = $actionField->Risks();

        if ($risks->count()) {
            foreach ($risks as $risk) {
                $tmp['name'] = $risk->Name;
                $tmp['weight'] = $risk->Weight;
                $obj['risks'][] = $tmp;
            }
        }

        // export associate tasks
        $tasks = $actionField->Tasks();

        if ($tasks->count()) {
            foreach ($tasks as $task) {
                $obj['tasks'][] = ['name' => $task->Name];
            }
        }

        return $obj;
    }

    /**
     * Is the {@link Questionnaire} to which this record's {@link AnswerActionField}
     * and {@link Question} relations are related, a "Risk" type?
     *
     * @return boolean
     */
    public function isRiskType(): bool
    {
        if (!$this->exists()) {
            return false;
        }

        $questionnaireIsRiskType = $this->Question()
                ->Questionnaire()
                ->isRiskType();

        $taskIsRiskType = $this->Question()
                ->Task()
                ->isRiskType();

        return $questionnaireIsRiskType || $taskIsRiskType;
    }

    /**
     * question has many action fields but user can select only one action
     * and get all the risks of the selected action
     *
     * @param array $actionFields question has many action field
     * @param array $answers      answer array of the action fields
     *
     * @return array
     */
    public static function get_risk_for_action_fields($actionFields, $answers) : array
    {
        $selectedActionRisks = [];

        // traverse question's action fields
        foreach ($actionFields as $actionField) {
            // collect action field in variable
            $actionFieldID = $actionField['ID'];
            $selectedActionField = [];

            // get the selected action from answer
            // filter if action field id exists and action is chose
            $selectedActionField = array_filter($answers['actions'], function ($e) use ($actionFieldID) {
                return isset($e['id']) && $e['id'] == $actionFieldID && $e['isChose'];
            });

            // if action is not selected, then continue for next action field
            if (empty($selectedActionField)) {
                continue;
            }

            // get all the risk weight associate with selected action
            return $selectedActionRisks = isset($actionField['Risks']) ? $actionField['Risks'] : [];
        }

        return $selectedActionRisks;
    }
}
