<?php

/**
 * This file contains the "Pillar" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Model;

use NZTA\SDLT\Model\Dashboard;
use SilverStripe\ORM\DataObject;
use SilverStripe\Forms\DropdownField;
use SilverStripe\Forms\CheckboxField;
use SilverStripe\GraphQL\Scaffolding\Interfaces\ScaffoldingProvider;
use SilverStripe\GraphQL\Scaffolding\Scaffolders\SchemaScaffolder;
use SilverStripe\Security\Member;
use SilverStripe\Security\Group;
use SilverStripe\Security\Security;
use NZTA\SDLT\Traits\SDLTModelPermissions;
use SilverStripe\Forms\FormField;

/**
 * Class Pillar
 *
 * @property string Label
 *
 * @method Dashboard Dashboard()
 * @method Questionnaire Questionnaire()
 *
 * // TODO: We need to allow Pillar to target at QuestionnaireGroup (e.g, Product, Project or Solution)
 */
class Pillar extends DataObject implements ScaffoldingProvider
{
    use SDLTModelPermissions;
    /**
     * @var string
     */
    private static $table_name = 'Pillar';

    /**
     * @var array
     */
    private static $db = [
        'Label' => 'Varchar(255)',
        'Disabled' => 'Boolean',
        'Type' => 'Varchar(255)',
        'SortOrder' => 'Int',
        // Members of the "Administrators" group determine if a pillar's
        // related questionnaire(s)' approval status, can be overridden by members
        // of the "NZTA-SDLT-SecurityArchitect" group.
        'ApprovalOverrideBySecurityArchitect' => 'Boolean',
    ];

    /**
     * @var array
     */
    private static $has_one = [
        'Dashboard' => Dashboard::class,
    ];

    /**
     * @var array
     */
    private static $has_many = [
        'Questionnaire' => Questionnaire::class,
    ];

    /**
     * @var array
     */
    private static $summary_fields = [
        'Label'
    ];

    /**
     * @var string
     */
    private static $default_sort = 'SortOrder';

    /**
     * @var array
     */
    private static $pillar_type = [
        'proof_of_concept' => 'PROOF OF CONCEPT OR SOFTWARE TRIAL',
        'software_as_service' => 'SOFTWARE AS A SERVICE (SAAS)',
        'product_project_or_solution' => 'PRODUCT, PROJECT OR SOLUTION',
        'feature_or_bug_fix' => 'FEATURE OR BUG FIX'
    ];

    /**
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();
        $user = Security::getCurrentUser();

        $fields->removeByName('SortOrder');
        $fields->addFieldsToTab(
            'Root.Main',
            [
                DropdownField::create(
                    'Type',
                    'Pillar Type',
                    self::$pillar_type
                )->setDescription('The selected value will be used to dispaly icon
                    in the front-end for the Pillar.'),
                $overrideFieldSA = CheckboxField::create(
                    'ApprovalOverrideBySecurityArchitect',
                    'Allow BO and CISO approval skipping'
                )->setDisabled(true)
            ]
        );

        if ($user && $user->getIsAdmin()) {
            $overrideFieldSA->setDisabled(false);
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
        $pillarScaffolder = $scaffolder
            ->type(Pillar::class)
            ->addFields([
              'ID',
              'Label',
              'Disabled',
              'Type'
            ]);

        // Provide relations
        $pillarScaffolder
            ->nestedQuery('Questionnaire')
            ->setUsePagination(false)
            ->end();

        return $scaffolder;
    }

    /**
     * Determine if this pillar has been set to override by a member of a group
     * determined by the $groupCode param.
     *
     * @param  string  $groupCode The code of a group
     * @return boolean
     * @throws Exception
     */
    public function isApprovalOverriddenBy(string $groupCode) : bool
    {
        if (!Group::get()->filter(['Code' => $groupCode])->exists()) {
            throw new \InvalidArgumentException("The group $groupCode was not found.");
        }

        $parts = '';
        $code = str_replace('sdlt-', '', $groupCode);

        foreach (explode('-', $code) as $part) {
            $parts .= ucfirst(strtolower($part));
        }

        $approvalField = sprintf('ApprovalOverrideBy%s', str_replace('sdlt-', '', $parts));
        $modelFields = array_keys($this->getSchema()->databaseFields(static::class, false));

        if (!in_array($approvalField, $modelFields)) {
            throw new \LogicException("The field $approvalField was not found.");
        }

        return $this->$approvalField;
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
}
