<?php

/**
 * This file contains the "Task" class.
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
use SilverStripe\Core\Convert;
use SilverStripe\Forms\FieldList;
use SilverStripe\GraphQL\OperationResolver;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\HasManyList;
use SilverStripe\Security\Group;
use SilverStripe\Security\Security;
use Symbiote\GridFieldExtensions\GridFieldOrderableRows;
use SilverStripe\Forms\GridField\GridFieldAddExistingAutocompleter;
use SilverStripe\Forms\GridField\GridFieldPaginator;
use NZTA\SDLT\Traits\SDLTModelPermissions;
use SilverStripe\ORM\ArrayList;
use SilverStripe\Forms\GridField\GridFieldConfig_Base;
use SilverStripe\Forms\GridField\GridField_ActionMenu;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridFieldDataColumns;
use NZTA\SDLT\Form\GridField\GridFieldCustomEditAction;
use NZTA\SDLT\ModelAdmin\QuestionnaireAdmin;
use SilverStripe\Forms\LiteralField;
use SilverStripe\View\ArrayData;

/**
 * Class Task
 *
 * @property string Name
 * @property boolean DisplayOnHomePage
 * @property string KeyInformation
 * @property string TaskType
 * @property boolean LockAnswersWhenComplete
 *
 * @method HasManyList Questions()
 */
class Task extends DataObject implements ScaffoldingProvider
{
    use SDLTModelPermissions;

    /**
     * @var string
     */
    private static $table_name = 'Task';

    /**
     * @var array
     */
    private static $db = [
        'Name' => 'Varchar(255)',
        'DisplayOnHomePage'=> 'Boolean',
        'KeyInformation' => 'HTMLText',
        'TaskType' => 'Enum(array("questionnaire", "selection"))',
        'LockAnswersWhenComplete' => 'Boolean',
        'IsApprovalRequired' => 'Boolean',
    ];

    /**
     * @var array
     */
    private static $has_one = [
        'ApprovalGroup' => Group::class
    ];

    /**
     * @var array
     */
    private static $has_many = [
        'Questions' => Question::class,
        'SubmissionEmails' => TaskSubmissionEmail::class
    ];

    /**
     * @var array
     */
    private static $belongs_many_many = [
        'Questionnaires' => Questionnaire::class,
        'AnswerActionFields' => AnswerActionField::class
    ];

    /**
     * @var array
     */
    private static $summary_fields = [
        'Name',
        'TaskType',
        'DisplayOnHomePage.Nice' => 'Display On Home Page',
        'LockAnswersWhenComplete.Nice' => 'Lock Answers When Complete',
        'IsApprovalRequired.Nice' => 'Is Approval Required'
    ];

    /**
     * @var array
     */
    private static $searchable_fields = [
        'Name',
        'TaskType'
    ];

    /**
     * CMS Fields
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        // if task type is selection, then please hide Questions tab
        if ($this->TaskType === 'selection') {
            $fields->removeByName('Questions');
        } else {
            /* @var GridField $questions */
            $questions = $fields->dataFieldByName('Questions');

            if ($questions) {
                $config = $questions->getConfig();
                $config
                    ->addComponent(new GridFieldOrderableRows('SortOrder'))
                    ->removeComponentsByType(GridFieldAddExistingAutocompleter::class)
                    ->getComponentByType(GridFieldPaginator::class)
                    ->setItemsPerPage(250);
            }
        }

        // create approval tab
        $fields->addFieldsToTab(
            'Root.TaskApproval',
            [
                $fields
                    ->dataFieldByName('IsApprovalRequired')
                    ->setTitle('Always require approval'),
                $fields
                    ->dataFieldByName('ApprovalGroupID')
                    ->setDescription('Please select the task approval group.'),
            ]
        );

        if ($this->getUsedOnData()->Count()) {
          $fields->addFieldToTab(
              'Root.UsedOn',
              $this->getUsedOnGridField()
          );
        } else {
            $fields->addFieldToTab(
                'Root.UsedOn',
                LiteralField::create(
                    "UsedOn",
                    "<p class=\"alert alert-info\">Sorry, no data to display.</p>"
                )
            );
        }

        $fields->removeByName(['Questionnaires', 'AnswerActionFields']);

        return $fields;
    }

    /**
     * Get used on grid field
     *
     * @return GridField
     */
    public function getUsedOnGridField()
    {
        // used on grid field
        $config = GridFieldConfig_Base::create();

        // add custom edit button
        $config
            ->addComponent(new GridField_ActionMenu())
            ->addComponent(new GridFieldCustomEditAction());

        // here we are using ArrayList to display the grid data
        // that's why we have to set DisplayFields otherwise we will get error
        // error :- the method 'summaryFields' does not exist on 'SilverStripe\View\ArrayData'
        $dataColumns = $config->getComponentByType(GridFieldDataColumns::class);

        $dataColumns->setDisplayFields(array(
          'Name' => 'Questionnaire / Task Name',
          'Question' => 'Question Title',
          'UsedOn'=> 'Used On'
        ));

        $usedOnGridfield = GridField::create(
            "UsedOn",
            "Used On",
            $this->getUsedOnData(),
            $config
        );

        return $usedOnGridfield;
    }

    /**
     * @return array
     */
    public function getQuestionsData()
    {
        $questions = $this->Questions();
        $questionsData = [];

        foreach ($questions as $question) {
            /* @var $question Question */
            $questionData['ID'] = $question->ID;
            $questionData['Title'] = $question->Title;
            $questionData['Question'] = $question->Question;
            $questionData['Description'] = $question->Description;
            $questionData['AnswerFieldType'] = $question->AnswerFieldType;
            $questionData['AnswerInputFields'] = $question->getAnswerInputFieldsData();
            $questionData['AnswerActionFields'] = $question->getAnswerActionFieldsData();
            $questionsData[] = $questionData;
        }

        return $questionsData;
    }

    /**
     * @return string
     */
    public function getQuestionsDataJSON()
    {
        return (string)json_encode($this->getQuestionsData());
    }

    /**
     * Provide GraphQL scaffolding
     * @param SchemaScaffolder $scaffolder scaffolder
     * @return SchemaScaffolder
     */
    public function provideGraphQLScaffolding(SchemaScaffolder $scaffolder)
    {
        $typeScaffolder = $scaffolder
            ->type(self::class)
            ->addFields([
                'ID',
                'Name',
                'TaskType',
                'QuestionsDataJSON'
            ]);

        $typeScaffolder
            ->operation(SchemaScaffolder::READ_ONE)
            ->setName('readTask')
            ->setResolver(new class implements OperationResolver {
                /**
                 * Invoked by the Executor class to resolve this mutation / query
                 * @see Executor
                 *
                 * @param mixed       $object  object
                 * @param array       $args    args
                 * @param mixed       $context context
                 * @param ResolveInfo $info    info
                 * @throws GraphQLAuthFailure
                 * @return mixed
                 */
                public function resolve($object, array $args, $context, ResolveInfo $info)
                {
                    $member = Security::getCurrentUser();
                    if (!$member) {
                        throw new GraphQLAuthFailure();
                    }

                    $task = Task::get_by_id(Convert::raw2sql(trim($args['ID'])));
                    return $task;
                }
            })
            ->end();
    }

    /**
     * Is this task classified as a "Standalone" task?
     *
     * @return boolean
     */
    public function isStandalone() : bool
    {
        return (bool) $this->DisplayOnHomePage;
    }

    /**
     * Deal with pre-write processes.
     *
     * @return void
     */
    public function onBeforeWrite()
    {
        parent::onBeforeWrite();

        $this->audit();
    }

    /**
     * Encapsulates all model-specific auditing processes.
     *
     * @return void
     */
    protected function audit() : void
    {
        $user = Security::getCurrentUser();

        // Auditing: CREATE, when:
        // - A user is present AND
        // - User is in group that can access admin AND
        // - Record is new
        $doAudit = (
            !$this->exists() &&
            $user && (
                $user->getIsSA() ||
                $user->getIsCISO() ||
                $user->getIsAdmin()
            )
        );

        $userData = '';

        if ($user) {
            $groups = $user->Groups()->column('Title');
            $userData = implode('. ', [
                'Email: ' . $user->Email,
                'Group(s): ' . ($groups ? implode(' : ', $groups) : 'N/A'),
            ]);
        }

        if ($doAudit) {
            $msg = sprintf('"%s" was created', $this->Name);
            $this->auditService->commit('Create', $msg, $this, $userData);
        }

        // Auditing: CREATE, when:
        // - ANY user is present AND
        // - Record is new AND
        // - Task is "Standalone" (DisplayOnHomePage field has been set)
        $doAudit = (
            !$this->exists() &&
            $user &&
            $this->isStandalone()
        );

        if ($doAudit) {
            $msg = sprintf('"%s" (Standalone Task) was created', $this->Name);
            $this->auditService->commit('Create', $msg, $this, $userData);
        }
    }

    /**
     * validate the Approval Group based on the IsApprovalRequired flag
     *
     * @return ValidationResult
     */
    public function validate()
    {
        $result = parent::validate();

        if ($this->IsApprovalRequired && !$this->ApprovalGroup()->exists()) {
            $result->addError('Please select Approval group.');
        }

        return $result;
    }

    /**
     * return Array List
     *
     * @return ValidationResult
     */
    public function getUsedOnData()
    {
        $finaldata = ArrayList::create();

        // get questionnaire list
        $questionnaires = $this->Questionnaires();
        foreach ($questionnaires as $questionnaire) {
            $data['Name'] = $questionnaire->Name;
            $data['Link'] = $questionnaire->getLink();
            $data['Question'] = '';
            $data['UsedOn'] = 'Questionnaire Level';

            $finaldata->push(ArrayData::create($data));
        }

        // get question list
        $actions = $this->AnswerActionFields();
        foreach ($actions as $action) {
            $question = $action->Question();

            $name = $question->QuestionnaireID ?
                $question->Questionnaire()->Name : $question->Task()->Name;

            $usedOn = $question->QuestionnaireID ?
                "Questionnaire's Question" : "Task's Question";

            $data['Name'] = $name;
            $data['Link'] = $question->getLink();
            $data['Question'] = $usedOn;
            $data['UsedOn'] = 'Questionnaire Level';

            $finaldata->push(ArrayData::create($data));
        }

        return $finaldata;
    }

    /**
     * get current object link in model admin
     *
     * @return string
     */
    public function getLink($action = 'edit')
    {
        $admin = QuestionnaireAdmin::create();
        return $admin->Link('NZTA-SDLT-Model-Task/EditForm/field/NZTA-SDLT-Model-Task/item/' . $this->ID . '/' . $action);
    }
}
