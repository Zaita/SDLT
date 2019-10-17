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
use SilverStripe\Security\Group;
use SilverStripe\Security\Security;
use SilverStripe\View\ArrayData;
use Symbiote\GridFieldExtensions\GridFieldOrderableRows;
use SilverStripe\Core\Convert;

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
    use SDLTRiskCalc;

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
        'TaskType' => 'Enum(array("questionnaire", "selection", "risk questionnaire", "security risk assessment", "control validation audit"))',
        'LockAnswersWhenComplete' => 'Boolean',
        'IsApprovalRequired' => 'Boolean',
        'RiskCalculation' => "Enum('NztaApproxRepresentation,Maximum')",
        'ComponentTarget' => "Enum('JIRA Cloud,Local')",
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
        'LikelihoodThresholds' => LikelihoodThreshold::class,
        'RiskRatings' => RiskRating::class,
    ];

    /**
     * @var array
     */
    private static $belongs_many_many = [
        'Questionnaires' => Questionnaire::class,
        'AnswerActionFields' => AnswerActionField::class
    ];

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

        $fields->removeByName([
            'TaskType',
            'RiskCalculation',
        ]);

        $fields->removeByName(['RiskQuestionnaireDataSourceID']);
        // If TaskType doesn't require Questions, hide the "Questions" tab
        if ($this->isSelectionType() || $this->isSRAType()) {
            // A "selection" type, has no Questions
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

        if ($this->TaskType === 'risk questionnaire') {
            // Restrict relations to risk-type Questionnaire records
            $rqGrid = $fields->findOrMakeTab('Root.Questionnaires.Questionnaires');
            $rqGrid->getConfig()->getComponentByType(GridFieldAddExistingAutocompleter::class)
                ->setSearchList(Questionnaire::get()->each(function ($q) {
                    return $q->isRiskType();
                }))
                ->setPlaceholderText('Find Risk Questionnaires by Name');
        }

        $fields->insertAfter('Name', $typeField
            ->setEmptyString('-- Select One --')
            ->setSource(Utils::pretty_source($this, 'TaskType'))
        );

        $fields->insertAfter('TaskType', $riskField
            ->setEmptyString('-- Select One --')
            ->setSource(Utils::pretty_source($this, 'RiskCalculation'))
            ->setDescription(''
                . 'Select the most appropriate formula with which to perform'
                . ' risk calculations.'
            )
                ->displayIf('TaskType')
                ->isEqualTo('risk questionnaire')
                ->end()
        );

        $fields->insertAfter('TaskType', DropdownField::create('ComponentTarget', 'Target')
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

        $fields->removeByName(['LikelihoodThresholds', 'RiskRatings']);
        if ($this->isSRAType()) {

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
        }

        $fields->removeByName(['Questionnaires', 'AnswerActionFields']);

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
                'Name' => $threshold->Name,
                'Value' => $threshold->Value,
                'Colour' => $threshold->Colour,
                'Operator' => $threshold->Operator,
            ];
        }

        return $thresholdData;
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

        if ($this->IsApprovalRequired && !$this->ApprovalGroup()->exists()) {
            $result->addError('Please select Approval group.');
        } else if (!$this->TaskType) {
            $result->addError('Please select a task type.');
        } else if ($this->TaskType === 'risk questionnaire' && !$this->RiskCalculation) {
            $result->addError('Please select a risk-calculation.');
        } else if ($this->ID && $this->isSRAType() && !$this->RiskQuestionnaireDataSourceID) {
            $result->addError('Please select a data source for the risk questionnaire.');
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
    public function getCVA_CMSFields($fields) {
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

        if($this->ID) {
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
}
