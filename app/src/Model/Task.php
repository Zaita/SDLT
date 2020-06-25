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
use NZTA\SDLT\Form\GridField\GridFieldCustomEditAction;
use NZTA\SDLT\GraphQL\GraphQLAuthFailure;
use NZTA\SDLT\Helper\Utils;
use NZTA\SDLT\ModelAdmin\QuestionnaireAdmin;
use NZTA\SDLT\Model\LikelihoodThreshold;
use NZTA\SDLT\Model\RiskRating;
use NZTA\SDLT\Model\TaskSubmission;
use NZTA\SDLT\Traits\SDLTModelPermissions;
use NZTA\SDLT\Traits\SDLTRiskCalc;
use SilverStripe\Forms\DropdownField;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridFieldAddExistingAutocompleter;
use SilverStripe\Forms\GridField\GridFieldConfig_Base;
use SilverStripe\Forms\GridField\GridFieldConfig_RecordEditor;
use SilverStripe\Forms\GridField\GridFieldDataColumns;
use SilverStripe\Forms\GridField\GridFieldPaginator;
use SilverStripe\Forms\GridField\GridField_ActionMenu;
use SilverStripe\Forms\ListboxField;
use SilverStripe\Forms\LiteralField;
use SilverStripe\GraphQL\OperationResolver;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use SilverStripe\ORM\ArrayList;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\HasManyList;
use SilverStripe\View\ArrayData;
use Symbiote\GridFieldExtensions\GridFieldOrderableRows;
use SilverStripe\Core\Convert;
use NZTA\SDLT\Extension\GroupExtension;
use SilverStripe\Security\Group;
use SilverStripe\Security\Security;
use SilverStripe\Security\Member;
use SilverStripe\Security\Permission;
use SilverStripe\Security\PermissionProvider;

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
class Task extends DataObject implements ScaffoldingProvider, PermissionProvider
{
    use SDLTModelPermissions;
    use SDLTRiskCalc;

    /**
     * @var string
     */
    private static $table_name = 'Task';

    /**
     * @var boolean
     */
    private static $show_overwrite_for_json_import = true;

    /**
     * @var array
     */
    private static $db = [
        'Name' => 'Varchar(255)',
        'DisplayOnHomePage'=> 'Boolean',
        'KeyInformation' => 'HTMLText',
        'TaskType' => 'Enum(array("questionnaire", "selection", "risk questionnaire", "security risk assessment", "control validation audit"))',
        'LockAnswersWhenComplete' => 'Boolean',
        'IsApprovalRequired' => 'Boolean',
        'RiskCalculation' => "Enum('NztaApproxRepresentation,Maximum')",
        'ComponentTarget' => "Enum('JIRA Cloud,Local')", // when task type is SRA
        'HideRiskWeightsAndScore' => 'Boolean' // when task type is risk questionnaire
    ];

    /**
     * @var array
     */
    private static $has_one = [
        'ApprovalGroup' => Group::class,
        //this is a task of type "risk questionnaire" to grab question data from
        //it must be filtered to RiskQuestionnaires only, and is required
        'RiskQuestionnaireDataSource' => Task::class
    ];

    /**
     * @var array
     */
    private static $has_many = [
        'Questions' => Question::class,
        'SubmissionEmails' => TaskSubmissionEmail::class,
        'LikelihoodThresholds' => LikelihoodThreshold::class, // when task type is SRA
        'RiskRatings' => RiskRating::class, // when task type is SRA
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
    private static $many_many = [
        'DefaultSecurityComponents' => SecurityComponent::class
    ];

    /**
     * @var array
     */
    private static $belongs_to = [
        'TaskSubmission' => TaskSubmission::class,
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
        $typeField = $fields->dataFieldByName('TaskType');
        $riskField = $fields->dataFieldByName('RiskCalculation');
        $hideWeightsAndScore = $fields->dataFieldByName('HideRiskWeightsAndScore');

        $fields->removeByName([
            'TaskType',
            'RiskCalculation',
            'RiskQuestionnaireDataSourceID',
            'LikelihoodThresholds',
            'RiskRatings',
            'DefaultSecurityComponents',
            'Questionnaires',
            'AnswerActionFields',
            'HideRiskWeightsAndScore'
        ]);

        $fields->insertAfter(
            'Name',
            $typeField
            ->setEmptyString('-- Select One --')
            ->setSource(Utils::pretty_source($this, 'TaskType'))
        );

        // If TaskType doesn't require Questions, hide the "Questions" tab
        if ($this->isSelectionType() || $this->isSRAType() || $this->isControlValidationAudit()) {
            $fields->removeByName(['Questions']);
        } else {
            /* @var GridField $questions */
            $questionsGridField = $fields->dataFieldByName('Questions');

            if ($questionsGridField) {
                $config = $questionsGridField->getConfig();
                $config
                    ->addComponent(new GridFieldOrderableRows('SortOrder'))
                    ->removeComponentsByType(GridFieldAddExistingAutocompleter::class)
                    ->getComponentByType(GridFieldPaginator::class)
                    ->setItemsPerPage(250);
            }
        }

        $fields->insertAfter(
            'TaskType',
            $riskField
            ->setEmptyString('-- Select One --')
            ->setSource(Utils::pretty_source($this, 'RiskCalculation'))
            ->setDescription(
                ''
                . 'Select the most appropriate formula with which to perform'
                . ' risk calculations.'
            )
                ->displayIf('TaskType')
                ->isEqualTo('risk questionnaire')
                ->end()
        );

        $fields->insertAfter(
            'RiskCalculation',
            $hideWeightsAndScore
                ->displayIf('TaskType')
                ->isEqualTo('risk questionnaire')
                ->end()
        );

        $fields->insertAfter(
            'TaskType',
            DropdownField::create('ComponentTarget', 'Target')
            ->setEmptyString('-- Select One --')
            ->setSource(Utils::pretty_source($this, 'ComponentTarget'))
            ->setDescription('Select the most appropriate target for selections.')
            ->displayIf('TaskType')
            ->isEqualTo('selection')
            ->end()
        );

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

        // add used on tab for task
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

        // if task type is SRA then add dropdown field for "Data source for risk questionnaire"
        // if no risk questionnaire task type exist then add warning message
        if ($this->isSRAType()) {
            $riskQuestionnaires = Task::get()->filter('TaskType', 'risk questionnaire');

            if (count($riskQuestionnaires)) {
                $fields->insertAfter(
                    'Name',
                    DropdownField::create(
                        'RiskQuestionnaireDataSourceID',
                        'Data source for risk questionnaire',
                        $riskQuestionnaires
                    )
                );
            } else {
                $fields->insertAfter(
                    'Name',
                    LiteralField::create(
                        'RiskQuestionnaireDataSourceID_Warning',
                        sprintf(
                            "<div class=\"alert alert-warning\">%s</div>",
                            'Please create a risk questionnaire task before '
                            .' creating a security risk assessment task'
                        )
                    )
                );
            }

            $fields->addFieldsToTab('Root.LikelihoodThresholds', [
                LiteralField::create(
                    'LikelihoodThresholdsNotice',
                    sprintf(
                        "<div class=\"alert alert-warning\">%s</div>",
                        'The thresholds entered here are sorted by value in '
                        . 'ascending order. The frontend matrix table performs'
                        . ' a lookup starting with the top-most item and makes '
                        . 'its way down the list. The first threshold which '
                        . 'meets the conditions is displayed on the page.'
                    )
                ),
                $likelihoodThresholdsField = GridField::create(
                    'LikelihoodThresholds',
                    'Likelihood Thresholds',
                    $this->LikelihoodThresholds(),
                    GridFieldConfig_RecordEditor::create()
                )
            ]);

            $fields->addFieldToTab(
                'Root.RiskRatingsMatrix',
                GridField::create(
                    'RiskRatings',
                    'Risk Rating Matrix',
                    $this->RiskRatings(),
                    GridFieldConfig_RecordEditor::create()
                )
            );

            $fields->removeByName([
                'TaskApproval',
            ]);
        }

        if ($this->isControlValidationAudit()) {
            $this->getCVA_CMSFields($fields);
        }

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
        $questions = null;
        if ($this->isSRAType()) {
            //RiskQuestionnaireDataSourceID
            $questionnaire = $this->RiskQuestionnaireDataSource();
            $questions = $questionnaire->Questions();
        } else {
            $questions = $this->Questions();
        }

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
     * @return LikelihoodThreshold[]
     */
    public function getLikelihoodRatingsData()
    {
        if (!$this->isSRAType()) {
            return [];
        }

        $thresholdData = [];

        foreach ($this->LikelihoodThresholds()->sort('Value ASC, Operator ASC') as $threshold) {
            $thresholdData[] = [
                'name' => $threshold->Name,
                'value' => $threshold->Value,
                'color' => $threshold->Colour,
                'operator' => $threshold->Operator,
            ];
        }

        return $thresholdData;
    }

    /**
     * @return array RiskRatings
     */
    public function getRiskRatingsData()
    {
        if (!$this->isSRAType()) {
            return [];
        }

        $thresholdData = [];

        foreach ($this->RiskRatings() as $threshold) {
            $thresholdData[] = [
                'riskRating' => $threshold->RiskRating,
                'impact' => $threshold->Impact,
                'color' => $threshold->Colour,
                'likelihood' => $threshold->Likelihood()->Name,
            ];
        }

        return $thresholdData;
    }

    /**
     * @return array RiskRatings matrix
     */
    public function getRiskRatingMatix()
    {
        $impactRatings = ImpactThreshold::get()->column('Name');
        $likelihoods = array_column($this->getLikelihoodRatingsData(), 'name');
        $riskRatings = $this->getRiskRatingsData();

        $tableHeader = array_merge(['Likelihood'], $impactRatings);
        $tableRows = [];

        foreach ($likelihoods as $likelihood) {
            $tableColumns = [];
            $tableColumns[] = ['name' => $likelihood, 'color'=> '#ffffff'];

            foreach ($impactRatings as $impact) {
                $filterRiskRating = array_filter($riskRatings, function ($riskRating) use ($impact, $likelihood) {
                    return $riskRating['impact'] == $impact && $riskRating['likelihood'] == $likelihood;
                });

                if ($filterRiskRating && $riskRating = array_pop($filterRiskRating)) {
                    $tableColumns[] = [
                        'name' => $riskRating['riskRating'],
                        'color' => '#' . $riskRating['color'],
                    ];
                } else {
                    $tableColumns[] = [
                        'name' => '',
                        'color' => '#ffffff',
                    ];
                }
            }
            $tableRows[] = $tableColumns;
        }

        return ['tableHeader' => $tableHeader, 'tableRows' =>  $tableRows];
    }

    /**$tableRows
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
                'QuestionsDataJSON',
                'ComponentTarget'
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
     * @return boolean
     */
    public function isRiskType() : bool
    {
        return $this->TaskType === 'risk questionnaire' && $this->RiskCalculation;
    }

    /**
     * @return boolean
     */
    public function isSRAType() : bool
    {
        return $this->TaskType === 'security risk assessment';
    }

    /**
     * @return boolean
     */
    public function isSelectionType() : bool
    {
        return $this->TaskType === 'selection';
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
     * Is this task classified as a "Component Selection" task?
     *
     * @return boolean
     */
    public function isComponentSelection() : bool
    {
        return $this->TaskType === 'selection';
    }

    /**
     * Is this task classified as a "Control validation audit" task?
     *
     * @return boolean
     */
    public function isControlValidationAudit() : bool
    {
        return $this->TaskType === 'control validation audit';
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

        // Auditing: CHANGE, when:
        // - User is present AND
        // - User is an Administrator
        // - Record exists
        $doAudit = (
            $this->exists() &&
            $user &&
            $user->getIsAdmin()
        );

        if ($doAudit) {
            $msg = sprintf('"%s" was modified', $this->Name);
            $groups = $user->Groups()->column('Title');
            $this->auditService->commit('Change', $msg, $this, $userData);
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

        // validation for require field
        if ($this->IsApprovalRequired && !$this->ApprovalGroup()->exists()) {
            $result->addError('Please select Approval group.');
        } elseif (!$this->TaskType) {
            $result->addError('Please select a task type.');
        } elseif ($this->TaskType === 'risk questionnaire' && !$this->RiskCalculation) {
            $result->addError('Please select a risk-calculation.');
        } elseif ($this->ID && $this->isSRAType() && !$this->RiskQuestionnaireDataSourceID) {
            $result->addError('Please select a data source for the risk questionnaire.');
        }

        // validation for unique task name
        $task = self::get()
           ->filter([
               'Name' => $this->Name
           ])->exclude('ID', $this->ID);

        if ($task->count()) {
            $result->addError(
                sprintf(
                    'Task name "%s" already exists. Please enter a unique Task name.',
                    $this->Name
                )
            );
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
     * @param string $action action type edit/add/delete
     * @return string
     */
    public function getLink($action = 'edit')
    {
        $admin = QuestionnaireAdmin::create();
        return $admin->Link('NZTA-SDLT-Model-Task/EditForm/field/NZTA-SDLT-Model-Task/item/'
            . $this->ID . '/' . $action);
    }


    /**
     * check target is remote (JIRA Cloud)
     *
     * @return Boolean
     */
    public function isRemoteTarget() : bool
    {
        return $this->ComponentTarget !== "Local";
    }

    /**
     * Update CMS Fields specific to the control validation audit task
     * At some point this should be moved into the getCMSFields method of a
     * separate subclass of Task
     *
     *
     * @param [type] $fields FieldList obtained from getCMSFields
     * @return FieldList a modified version of $fields, passed in via parameter
     */
    public function getCVA_CMSFields($fields)
    {
        //remove fields not required for CVA task
        $fields->removeByName([
            'Questions',
            'SubmissionEmails',
            'IsApprovalRequired',
            'ApprovalGroupID',
            'DisplayOnHomePage',
            'KeyInformation',
            'LockAnswersWhenComplete',
            'TaskApproval',
            'DefaultSecurityComponents'
        ]);

        if ($this->ID) {
            $fields->addFieldToTab(
                'Root.Main',
                ListboxField::create(
                    'DefaultSecurityComponents',
                    'Default Security Components',
                    SecurityComponent::get()
                )->setDescription(
                    'If no component selection task is configured, these default'
                    . ' security components will be selected for the security'
                    . ' risk assessment task. They will appear as selected'
                    . ' components in the task submission.'
                    . '<br/><br/><strong>Note: </strong>'
                    . 'The selected components of the component selection task'
                    . ' will always override the default components specified'
                    . ' here.'
                )
            );
        }
        return $fields;
    }

    /**
     * find or create a new task from the given name string
     *
     * @param string $name name of the task
     * @return DataObject
     */
    public static function find_or_make_by_name($name)
    {
        $taskInDB = Task::get()->filter([
            'Name' => $name
        ])->first();

        // if task doesn't exist with the given name then create one.
        if (empty($taskInDB)) {
            $newTask = Task::create();
            $newTask->Name = $name;
            $newTask->TaskType = "questionnaire";
            $newTask->write();
            $taskInDB = $newTask;
        }

        return $taskInDB;
    }

    /**
     * create questionnaire from json import
     * @param object  $incomingJson questionnaire json object
     * @param boolean $overwrite    overwrite the existing questionnaire
     * @return void
     */
    public static function create_record_from_json($incomingJson, $overwrite = false)
    {
        $taskJson = $incomingJson->task;
        $obj = '';

        if ($overwrite) {
            $obj = self::get_by_name($taskJson->name);
            if (!empty($obj)) {
                $obj->Questions()->removeAll();
            }
        }

        // if overwrite is false or obj doesn't exist with the same name then create a new object
        if (empty($obj)) {
            $obj = self::create();
        }

        $obj->Name = $taskJson->name ?? '';
        $obj->TaskType = $taskJson->taskType ?? 'questionnaire';
        $obj->KeyInformation =$taskJson->keyInformation ?? '';
        $obj->RiskCalculation = $taskJson->riskCalculation ?? 'NztaApproxRepresentation';
        $obj->LockAnswersWhenComplete = $taskJson->lockAnswersWhenComplete ?? false;
        $obj->IsApprovalRequired = $taskJson->isApprovalRequired ?? false;

        // add approval group if "approvalGroupName" key exist in the incoming json
        if (property_exists($taskJson, "approvalGroupName") &&
            !empty($approvalGroupTitle = $taskJson->approvalGroupName)) {
            $dbGroup = GroupExtension::find_or_make_by_name($approvalGroupTitle);
            $obj->ApprovalGroupID = $dbGroup->ID;
        }

        // add questions
        if (property_exists($taskJson, "questions") && !empty($questions = $taskJson->questions)) {
            foreach ($questions as $question) {
                $newQuestion = Question::create_record_from_json($question);
                $obj->Questions()->add($newQuestion);
            }

            // update action field if ActionType is goto, once all questions are added in db
            foreach ($questions as $question) {
                // find the current question by question title
                $questionInDB = $obj
                    ->Questions()
                    ->filter([
                        "Title" => $question->title
                    ])->first();

                if (property_exists($question, "answerActionFields") &&
                    !empty($answerActionFields = $question->answerActionFields)) {
                    foreach ($answerActionFields as $actionField) {
                        if ($actionField->actionType == "goto") {
                            // find the goto question by question title for action
                            $questionGotoInDB = $obj
                                ->Questions()
                                ->filter([
                                    "Title" => $actionField->gotoQuestionTitle,
                                    "AnswerFieldType" => $question->answerFieldType // type = action
                                ])->first();

                            // find the current action field
                            $actionFieldInDB = $questionInDB
                                ->AnswerActionFields()
                                ->filter([
                                    "Label" => $actionField->label,
                                    "ActionType" => $actionField->actionType // type = goto
                                ])->first();

                            // update action field relationship in db record
                            if ($questionGotoInDB && $actionFieldInDB) {
                                $actionFieldInDB->GotoID = $questionGotoInDB->ID;
                                $actionFieldInDB->write();
                            }
                        }
                    }
                }
            }
        }

        // add questionnaire level task
        if (property_exists($taskJson, "tasks") && !empty($tasks = $taskJson->tasks)) {
            foreach ($tasks as $task) {
                $dbTask = Task::find_or_make_by_name($task->name);
                $obj->Tasks()->add($dbTask);
            }
        }

        // add action-type goto relationship with question
        $obj->write();
    }

    /**
     * get task by name
     *
     * @param string $taskName task name
     * @return object|null
     */
    public static function get_by_name($taskName)
    {
        $task = Task::get()
            ->filter(['Name' => $taskName])
            ->first();

        return $task;
    }

    /**
     * permission-provider to import task
     *
     * @return array
     */
    public function providePermissions()
    {
        return [
            'IMPORT_TASK' => 'Allow user to import Task',
            'EXPORT_TASK' => 'Allow user to export Task'
        ];
    }

    /**
     * Only ADMIN users and user with import permission should be able to import task.
     *
     * @param Member $member to check the permission of
     * @return boolean
     */
    public function canImport($member = null)
    {
        if (!$member) {
            $member = Member::currentUser();
        }

        // checkMember(<Member>, [<at-least-one-match>])
        $canImport = Permission::checkMember($member, [
            'ADMIN',
            'IMPORT_TASK'
        ]);

        return $canImport;
    }
    /**
     * Only ADMIN users and user with export permission should be able to export Questionnaire.
     *
     * @param Member $member to check the permission of
     * @return boolean
     */
    public function canExport($member = null)
    {
        if (!$member) {
            $member = Member::currentUser();
        }

        // checkMember(<Member>, [<at-least-one-match>])
        $canImport = Permission::checkMember($member, [
            'ADMIN',
            'EXPORT_TASK'
        ]);

        return $canImport;
    }

    /**
     * export task
     *
     * @param object $task task
     * @return string
     */
    public static function export_record($task)
    {
        $obj['name'] = $task->Name;
        $obj['taskType'] =  $task->TaskType;
        $obj['keyInformation'] = $task->KeyInformation ?? '';
        $obj['lockAnswersWhenComplete'] = (boolean) $task->LockAnswersWhenComplete;
        $obj['isApprovalRequired'] = (boolean) $task->IsApprovalRequired;
        $obj['riskCalculation'] = $task->RiskCalculation;
        $obj['approvalGroupName'] = $task->ApprovalGroup()->Title ?: '';

        foreach ($task->Questions() as $question) {
            $obj['questions'][] = QUESTION::export_record($question);
        }

        $returnobj['task'] = $obj;

        return json_encode($returnobj, JSON_PRETTY_PRINT);
    }
}
