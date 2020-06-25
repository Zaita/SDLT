<?php
/**
 * This file contains the "Questionnaire" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Model;

use NZTA\SDLT\Constant\UserGroupConstant;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use SilverStripe\ORM\DataObject;
use SilverStripe\Security\Security;
use Symbiote\GridFieldExtensions\GridFieldOrderableRows;
use SilverStripe\Forms\GridField\GridFieldPaginator;
use SilverStripe\Security\Group;
use SilverStripe\Forms\GridField\GridFieldSortableHeader;
use SilverStripe\Forms\GridField\GridFieldFilterHeader;
use Symbiote\GridFieldExtensions\GridFieldTitleHeader;
use SilverStripe\Forms\GridField\GridFieldAddExistingAutocompleter;
use NZTA\SDLT\Traits\SDLTModelPermissions;
use SilverStripe\Security\Permission;
use NZTA\SDLT\ModelAdmin\QuestionnaireAdmin;
use NZTA\SDLT\Helper\Utils;
use NZTA\SDLT\Traits\SDLTRiskCalc;
use SilverStripe\Forms\CheckboxField;
use SilverStripe\Forms\OptionsetField;
use SilverStripe\Security\PermissionProvider;
use SilverStripe\Security\Member;

/**
 * Class Questionnaire
 *
 * This class represents multiple "kinds" of questionnaire.
 *
 * A Risk Questionnaire allows administrators to populate a submission's answers
 * with with risks and based on the answers given, allocate a weighting that covers
 * both the answer and the risk.
 *
 * Risks & Weights are only applicable to multi-choice answers where >=1 {@link Risk}
 * is able to be associated with each multi-choice answer.
 *
 * Example:
 *
 * - An answer comprises the following multiple choices: "A","B","C"
 * - One or more risks can be associated with "A", "B" and/or "C"
 * - Once assigned a risk, an admin can then add a "Weighting" (Range 0-100) to
 *   each answer+risk combination.
 */
class Questionnaire extends DataObject implements ScaffoldingProvider, PermissionProvider
{
    use SDLTModelPermissions;
    use SDLTRiskCalc;

    /**
     * @var string
     */
    private static $table_name = 'Questionnaire';

    /**
     * @var integer
     */
    private static $expiry_days = 14;

    /**
     * @var integer
     */
    private static $min_expiry_days = 5;

    /**
     * @var boolean
     */
    private static $show_overwrite_for_json_import = true;

    /**
     * @var array
     */
    private static $db = [
        'Name' => 'Varchar(255)',
        'KeyInformation' => 'HTMLText',
        'Type' => "Enum('Questionnaire,RiskQuestionnaire')",
        'RiskCalculation' => "Enum('NztaApproxRepresentation,Maximum')",
        'ApprovalIsNotRequired' => 'Boolean',
        'DoesSubmissionExpire' => "Enum('No,Yes', 'Yes')",
        'ExpireAfterDays' => 'Int',
        'HideRiskWeightsAndScore' => 'Boolean'
    ];

    /**
     * @var array
     */
    private static $defaults = [
        'ExpireAfterDays' => 14,
        'DoesSubmissionExpire' => 'Yes',
    ];

    /**
     * @var array
     */
    private static $has_one = [
        'Pillar' => Pillar::class
    ];

    /**
     * @var array
     */
    private static $has_many = [
        'Questions' => Question::class
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
    private static $summary_fields = [
        'Name',
        'Type',
    ];

    /**
     * Defines a customised list of filters for the search context
     * @return array
     */
    public function searchableFields()
    {
        return [
            'Name' => [
                'filter' => 'PartialMatchFilter',
                'title' => 'Name',
            ],
            'Type' => [
                'filter' => 'ExactMatchFilter',
                'title' => 'Type'
            ]
        ];
    }

    /**
     * Legacy questionnaires will not have a "Type" field for display in e.g.
     * $summary_fields.
     *
     * @return string
     */
    public function getType()
    {
        return $this->getField('Type') ?: 'Questionnaire';
    }

    /**
     * CMS Fields.
     *
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();
        $questions = $fields->dataFieldByName('Questions');

        $typeField = $fields->dataFieldByName('Type');
        $riskField = $fields->dataFieldByName('RiskCalculation');
        $fields->removeByName([
            'PillarID',
            'Type',
            'RiskCalculation'
        ]);

        if ($questions) {
            $config = $questions->getConfig();
            $config->addComponent(
                new GridFieldOrderableRows('SortOrder')
            );

            $config->removeComponentsByType(GridFieldSortableHeader::class);
            $config->removeComponentsByType(GridFieldFilterHeader::class);
            $config->removeComponentsByType(GridFieldAddExistingAutocompleter::class);
            $config->addComponent(new GridFieldTitleHeader());

            $pageConfig = $config->getComponentByType(GridFieldPaginator::class);
            $pageConfig->setItemsPerPage(250);
        }

        $fields->insertAfter(
            'Name',
            $typeField
                ->setEmptyString('-- Select One --')
                ->setSource(Utils::pretty_source($this, 'Type'))
        );

        $fields->insertAfter(
            'Type',
            $riskField
                ->setEmptyString('-- Select One --')
                ->setSource(Utils::pretty_source($this, 'RiskCalculation'))
                ->setDescription(
                    ''
                    . 'Select the most appropriate formula with which to perform'
                    . ' risk calculations.'
                )
                ->displayIf('Type')
                ->isEqualTo('RiskQuestionnaire')
                ->end()
        );

        if ($this->isRiskType()) {
            $fields->addFieldsToTab(
                'Root.Main',
                [
                    CheckboxField::create(
                    'ApprovalIsNotRequired',
                    'Bypass all approvals'
                    )
                        ->setDescription('If this option is set, then no approvals are'
                        .' required, and no emails will be sent. This bypasses approvals'
                        .' only if the questionnaire submission has no tasks to complete.'
                        .' If there are tasks, then normal approval flow will be applied.'),
                    CheckboxField::create('HideRiskWeightsAndScore')
                ]
            );
        } else {
            $fields->removeByName(['ApprovalIsNotRequired', 'HideRiskWeightsAndScore']);
        }

        $fields->removeByName(['DoesSubmissionExpire']);

        $fields->addFieldsToTab(
            'Root.Main',
            [
                OptionsetField::create(
                    'DoesSubmissionExpire',
                    'Should Submission Expire?',
                    $this->dbObject('DoesSubmissionExpire')->enumValues()
                )->setHasEmptyDefault(false)
                ->setDescription('If this is not set, this value will default '
                    .'to "Yes" with an expiry time for 14 days'),

                $fields->dataFieldByName('ExpireAfterDays')
                    ->setTitle('Expiry Time (Days)')
                    ->setAttribute('min', $this->config()->min_expiry_days)
                    ->setDescription(
                        'If this is not set, submissions will auto-expire in '
                        .$this->config()->expiry_days
                        .' days.'
                    )
                    ->displayIf('DoesSubmissionExpire')
                    ->isEqualTo('Yes')
                    ->end()
            ],
            'ApprovalIsNotRequired'
        );

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
            ->type(Questionnaire::class)
            ->addFields([
                'ID',
                'Name',
                'KeyInformation',
                'Type',
                'RiskCalculation',
            ]);

        // Provide relations
        $typeScaffolder
            ->nestedQuery('Questions')
            ->setUsePagination(false)
            ->end();

        // Provide operations
        $typeScaffolder
            ->operation(SchemaScaffolder::READ_ONE)
            ->setName('readQuestionnaire')
            ->end();

        return $scaffolder;
    }

    /**
     * @return boolean
     */
    public function isRiskType() : bool
    {
        return $this->Type === 'RiskQuestionnaire' && $this->RiskCalculation;
    }

    /**
     * Generate default security groups for the SDLT application
     *
     * @return void
     */
    public function requireDefaultRecords()
    {
        parent::requireDefaultRecords();

        //if any questionnaire has ExpireAfterDays set to 0, default to the expiry_days setting
        foreach (self::get() as $questionnaire) {
            if ($questionnaire->getField('ExpireAfterDays') == 0) {
                $questionnaire->setField('ExpireAfterDays', $this->config()->expiry_days);
                $questionnaire->write();
            }
        }
        $this->createDefaultSDLTMemberGroups();
    }

    /**
     * Generate default security groups for the SDLT application
     *
     * @return void
     * @throws \SilverStripe\ORM\ValidationException
     */
    public function createDefaultSDLTMemberGroups()
    {
        $cisoGroup = Group::get()->find('Code', UserGroupConstant::GROUP_CODE_CISO);

        if (!($cisoGroup && $cisoGroup->ID)) {
            $cisoGroup = Group::create();
            $cisoGroup->Title = 'NZTA-SDLT-CISO';
            $cisoGroup->Code = UserGroupConstant::GROUP_CODE_CISO;
            $cisoGroup->write();
        }

        $saGroup = Group::get()->find('Code', UserGroupConstant::GROUP_CODE_SA);

        if (!($saGroup && $saGroup->ID)) {
            $saGroup = Group::create();
            $saGroup->Title = 'NZTA-SDLT-SecurityArchitect';
            $saGroup->Code = UserGroupConstant::GROUP_CODE_SA;
            $saGroup->write();
        }

        $usersGroup = Group::get()->find('Code', UserGroupConstant::GROUP_CODE_USER);

        if (!($usersGroup && $usersGroup->ID)) {
            $usersGroup = Group::create();
            $usersGroup->Title = 'NZTA-SDLT-Users';
            $usersGroup->Code = UserGroupConstant::GROUP_CODE_USER;
            $usersGroup->write();
        }

        $reportersGroup = Group::get()->find('Code', UserGroupConstant::GROUP_CODE_REPORTER);
        if (!($reportersGroup && $reportersGroup->ID)) {
            $reportersGroup = Group::create();
            $reportersGroup->Title = 'SDLT Reporters';
            $reportersGroup->Code = UserGroupConstant::GROUP_CODE_REPORTER;
            $reportersGroup->write();

            $reportersGroupPermissions = [
                'CMS_ACCESS_NZTA\\SDLT\\ModelAdmin\\QuestionnaireSubmissionAdmin',
                'CMS_ACCESS_NZTA\\SDLT\\ModelAdmin\\QuestionnaireAdmin',
                'CMS_ACCESS_NZTA\\SDLT\\ModelAdmin\\SecurityComponentAdmin',
                'CMS_ACCESS_NZTA\\SDLT\\ModelAdmin\\TaskSubmissionAdmin',
            ];

            foreach ($reportersGroupPermissions as $perm) {
                $p = Permission::get()->filter(['Code' => $perm, 'GroupID' => $reportersGroup->ID])->first()
                    ?: Permission::create()->update(['Code' => $perm, 'GroupID' => $reportersGroup->ID]);
                $p->write();
            }
        }
    }

    /**
     * @return array
     */
    public function getQuestionsData()
    {
        $questions = $this->Questions();
        $finalData = [];

        foreach ($questions as $question) {
            /* @var $question Question */
            $questionData['ID'] = $question->ID;
            $questionData['Title'] = $question->Title;
            $questionData['Question'] = $question->Question;
            $questionData['Description'] = $question->Description;
            $questionData['AnswerFieldType'] = $question->AnswerFieldType;
            $questionData['AnswerInputFields'] = $question->getAnswerInputFieldsData();
            $questionData['AnswerActionFields'] = $question->getAnswerActionFieldsData();
            $finalData[] = $questionData;
        }

        return $finalData;
    }

    /**
     * @return Int
     */
    public function getExpireAfterDays() : int
    {
        $value = (int) $this->getField('ExpireAfterDays');

        if (!$value || $value < $this->config()->min_expiry_days) {
            $this->setField('ExpireAfterDays', $this->config()->expiry_days);
        }

        return (int) $this->getField('ExpireAfterDays');
    }

    /**
     * Deal with pre-write processes.
     *
     * @return void
     */
    public function onBeforeWrite()
    {
        parent::onBeforeWrite();

        //if the default submission question is not set at all, default to Yes
        //also set the default expire time in this case
        if ($this->DoesSubmissionExpire === null) {
            $this->DoesSubmissionExpire = 'Yes';
            $this->ExpireAfterDays = $this->config()->expiry_days;
        }

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
        $userData = '';

        if ($user) {
            $groups = $user->Groups()->column('Title');
            $userData = implode('. ', [
                'Email: ' . $user->Email,
                'Group(s): ' . ($groups ? implode(' : ', $groups) : 'N/A'),
            ]);
        }

        // Auditing: CREATE, when:
        // - User is present AND
        // - Record is new
        $doAudit = !$this->exists() && $user;

        if ($doAudit) {
            $msg = sprintf('"%s" was created', $this->Name);
            $groups = $user->Groups()->column('Title');
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
     * get current object link in model admin
     * @param string $action action name
     * @return string
     */
    public function getLink($action = 'edit')
    {
        $admin = QuestionnaireAdmin::create();
        return $admin->Link('NZTA-SDLT-Model-Questionnaire/EditForm/field/NZTA-SDLT-Model-Questionnaire/item/'
        . $this->ID . '/' . $action);
    }

    /**
     * @return ValidationResult
     */
    public function validate()
    {
        $result = parent::validate();

        // validation for require field
        if (!$this->Name) {
            $result->addError('Please add a questionnnaire name.');
        } elseif (!$this->Type) {
            $result->addError('Please select a questionnnaire type.');
        } elseif ($this->Type === 'RiskQuestionnaire' && !$this->RiskCalculation) {
            $result->addError('Please select a risk-calculation type.');
        }

        // validation for unique questionnaire name
        $questionnaire = self::get()
           ->filter([
               'Name' => $this->Name
           ])->exclude('ID', $this->ID);

        if ($questionnaire->count()) {
            $result->addError(
                sprintf(
                    'Questionnaire name "%s" already exists. Please enter a unique Questionnaire name.',
                    $this->Name
                )
            );
        }

        // validation for expiry date
        $changedFields = $this->getChangedFields();

        if (isset($changedFields['ExpireAfterDays']['after'])) {
            $newExpireAfterDays = $changedFields['ExpireAfterDays']['after'];
            $doesSubmissionExpire = ($this->DoesSubmissionExpire === 'Yes');
            $newValueIsInvalid = $newExpireAfterDays < $this->config()->min_expiry_days;

            if ($doesSubmissionExpire && $newValueIsInvalid) {
                $result->addError(
                    'Expiry time should be greater than '
                    . $this->config()->min_expiry_days
                    . ' days.'
                );
            }
        }

        return $result;
    }

    /**
     * get BypassApproval
     *
     * @return boolean
     */
    public function isBypassApproval() : bool
    {
        return $this->ApprovalIsNotRequired;
    }

    /**
     * create questionnaire from json import
     * @param object  $incomingJson questionnaire json object
     * @param boolean $overwrite    overwrite the existing questionnaire
     * @return void
     */
    public static function create_record_from_json($incomingJson, $overwrite = false)
    {
        $questionnaireJson = $incomingJson->questionnaire;
        $obj = '';

        if ($overwrite) {
            $obj = self::get_by_name($questionnaireJson->name);
            if (!empty($obj)) {
                $obj->Questions()->removeAll();
                $obj->Tasks()->removeAll();
            }
        }

        // if overwrite is false or obj doesn't exist with the same name then create a new object
        if (empty($obj)) {
            $obj = self::create();
        }

        $obj->Name = $questionnaireJson->name ?? '';
        $obj->Type =  $questionnaireJson->type ?? 'Questionnaire';
        $obj->KeyInformation = $questionnaireJson->keyInformation ?? '';
        $obj->RiskCalculation = $questionnaireJson->riskCalculation ?? 'NztaApproxRepresentation';
        $obj->ApprovalIsNotRequired = $questionnaireJson->bypassApproval ?? false;
        $obj->DoesSubmissionExpire = $questionnaireJson->doesSubmissionExpire ?? "Yes";
        $obj->ExpireAfterDays = $questionnaireJson->expireAfterDays ?? self::$expiry_days;

        // add questions
        if (property_exists($questionnaireJson, "questions") && !empty($questions = $questionnaireJson->questions)) {
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
                                    "Title" => $actionField->gotoQuestionTitle
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
        if (property_exists($questionnaireJson, "tasks") && !empty($tasks = $questionnaireJson->tasks)) {
            foreach ($tasks as $task) {
                $dbTask = Task::find_or_make_by_name($task->name);
                $obj->Tasks()->add($dbTask);
            }
        }

        $obj->write();
    }

    /**
     * get questionnaire by name
     *
     * @param string $questionnaireName questionnaire name
     * @return object|null
     */
    public static function get_by_name($questionnaireName)
    {
        $questionnaire = Questionnaire::get()
            ->filter(['Name' => $questionnaireName])
            ->first();

        return $questionnaire;
    }

    /**
     * permission-provider to import Questionnaire
     *
     * @return array
     */
    public function providePermissions()
    {
        return [
            'IMPORT_QUESTIONNAIRE' => 'Allow user to import Questionnaire',
            'EXPORT_QUESTIONNAIRE' => 'Allow user to export Questionnaire'
        ];
    }

    /**
     * Only ADMIN users and user with import permission should be able to import Questionnaire.
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
            'IMPORT_QUESTIONNAIRE'
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
            'EXPORT_QUESTIONNAIRE'
        ]);

        return $canImport;
    }

    /**
     * export questionnaire
     *
     * @param integer $questionnaire questionnaire
     * @return string
     */
    public static function export_record($questionnaire)
    {
        $obj['name'] = $questionnaire->Name;
        $obj['type'] =  $questionnaire->Type;
        $obj['keyInformation'] = $questionnaire->KeyInformation ?? '';
        $obj['riskCalculation'] = $questionnaire->RiskCalculation;
        $obj['bypassApproval'] = (boolean) $questionnaire->ApprovalIsNotRequired;
        $obj['doesSubmissionExpire'] = $questionnaire->DoesSubmissionExpire;
        $obj['expireAfterDays '] = $questionnaire->ExpireAfterDays;

        foreach ($questionnaire->Questions() as $question) {
            $obj['questions'][] = QUESTION::export_record($question);
        }

        $tasks = $questionnaire->Tasks();

        if ($tasks->count()) {
            foreach ($tasks as $task) {
                $obj['tasks'][] = ['name' => $task->Name];
            }
        }

        $returnobj['questionnaire'] = $obj;

        return json_encode($returnobj, JSON_PRETTY_PRINT);
    }
}
