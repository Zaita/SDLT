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
use SilverStripe\Security\Member;
use SilverStripe\Security\Security;
use Symbiote\GridFieldExtensions\GridFieldOrderableRows;
use SilverStripe\Forms\GridField\GridFieldPaginator;
use SilverStripe\Security\Group;
use SilverStripe\Forms\GridField\GridFieldSortableHeader;
use SilverStripe\Forms\GridField\GridFieldFilterHeader;
use Symbiote\GridFieldExtensions\GridFieldTitleHeader;

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
     * Allow logged-in user to access the model
     *
     * @param Member|null $member member
     * @return bool
     */
    public function canView($member = null)
    {
        return (Security::getCurrentUser() !== null);
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
}
