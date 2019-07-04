<?php

/**
 * This file contains the "QuestionnaireSubmissionAdmin" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\ModelAdmin;

use NZTA\SDLT\Model\QuestionnaireSubmission;
use SilverStripe\Admin\ModelAdmin;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridFieldConfig_RelationEditor;
use SilverStripe\Forms\GridField\GridFieldAddNewButton;
use SilverStripe\Forms\GridField\GridFieldEditButton;
use SilverStripe\Forms\GridField\GridFieldViewButton;
use SilverStripe\Forms\GridField\GridFieldAddExistingAutocompleter;
use SilverStripe\Forms\GridField\GridFieldDetailForm;
use SilverStripe\Forms\GridField\GridFieldDeleteAction;

/**
 * Class QuestionnaireSubmissionAdmin
 *
 * This class is used to manage Questionnaires sumission
 */
class QuestionnaireSubmissionAdmin extends ModelAdmin
{
    /**
     * @var string[]
     */
    private static $managed_models = [
        QuestionnaireSubmission::class,
    ];

    /**
     * @var string
     */
    private static $url_segment = 'questionnaire-submission-admin';

    /**
     * @var string
     */
    private static $menu_title = 'Questionnaires Submission';

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
        $config->removeComponentsByType(GridFieldDeleteAction::class);
        $config->removeComponentsByType(GridFieldAddExistingAutocompleter::class);
        $config->getComponentByType(GridFieldDetailForm::class)
            ->setItemRequestClass(QuestionnaireSubmissionDetailForm_ItemRequest::class);

        $gridField->setConfig($config);

        return $form;
    }
}
