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
use SilverStripe\ORM\HasManyList;
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
/**
 * Class Questionnaire
 *
 * @property string Name
 * @property string KeyInformation
 *
 * @method HasManyList Questions
 */
class Questionnaire extends DataObject implements ScaffoldingProvider
{
    use SDLTModelPermissions;
    /**
     * @var string
     */
    private static $table_name = 'Questionnaire';

    /**
     * @var array
     */
    private static $db = [
        'Name' => 'Varchar(255)',
        'KeyInformation' => 'HTMLText',
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
     * CMS Fields
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        $fields->removeByName('PillarID');

        $questions = $fields->dataFieldByName('Questions');

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
                'KeyInformation'
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
     * Generate default security groups for the SDLT application
     *
     * @return void
     */
    public function requireDefaultRecords()
    {
        parent::requireDefaultRecords();
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
     *
     * @return string
     */
    public function getLink($action = 'edit')
    {
        $admin = QuestionnaireAdmin::create();
        return $admin->Link('NZTA-SDLT-Model-Questionnaire/EditForm/field/NZTA-SDLT-Model-Questionnaire/item/' . $this->ID . '/' . $action);
    }
}
