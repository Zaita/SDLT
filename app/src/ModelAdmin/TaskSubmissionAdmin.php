<?php

/**
 * This file contains the "TaskSubmissionAdmin" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T.
 * @copyright 2019 New Zealand Transport Agency
 * @license https://nzta.govt.nz (BSD-3)
 * @link https://nzta.govt.nz
 */

namespace NZTA\SDLT\ModelAdmin;

use NZTA\SDLT\Model\TaskSubmission;
use SilverStripe\Admin\ModelAdmin;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridFieldConfig_RelationEditor;
use SilverStripe\Forms\GridField\GridFieldAddNewButton;
use SilverStripe\Forms\GridField\GridFieldEditButton;
use SilverStripe\Forms\GridField\GridFieldViewButton;
use SilverStripe\Forms\GridField\GridFieldAddExistingAutocompleter;

/**
 * Class TaskSubmissionAdmin
 *
 * This class is used to manage Questionnaires sumission
 */
class TaskSubmissionAdmin extends ModelAdmin
{
    /**
     * @var string[]
     */
    private static $managed_models = [
        TaskSubmission::class,
    ];

    /**
     * @var string
     */
    private static $url_segment = 'task-submission-admin';

    /**
     * @var string
     */
    private static $menu_title = 'Task Submissions';

    /**
     * @param int       $id     ID
     * @param FieldList $fields Fields
     * @return Form
     */
    public function getEditForm($id = null, $fields = null)
    {
        $form = parent::getEditForm($id, $fields);

        $gridFieldName = $this->sanitiseClassName($this->modelClass);

        /* @var GridField $gridField */
        $gridField = $form->Fields()->fieldByName($gridFieldName);
        $config = GridFieldConfig_RelationEditor::create();
        $config->removeComponentsByType(GridFieldAddNewButton::class);
        //$config->removeComponentsByType(GridFieldEditButton::class);
        $config->removeComponentsByType(GridFieldAddExistingAutocompleter::class);
        $config->AddComponents(new GridFieldViewButton());
        $gridField->setConfig($config);

        return $form;
    }
}
