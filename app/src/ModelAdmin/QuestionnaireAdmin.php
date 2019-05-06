<?php

/**
 * This file contains the "QuestionnaireAdmin" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\ModelAdmin;

use NZTA\SDLT\Model\Task;
use NZTA\SDLT\Model\Questionnaire;
use NZTA\SDLT\Model\QuestionnaireEmail;
use NZTA\SDLT\Model\Dashboard;
use SilverStripe\Admin\ModelAdmin;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridFieldConfig_RelationEditor;

/**
 * Class PillarAdmin
 *
 * This class is used to manage Questionnaires and Tasks
 */
class QuestionnaireAdmin extends ModelAdmin
{
    /**
     * @var string[]
     */
    private static $managed_models = [
        Dashboard::class,
        Questionnaire::class,
        Task::class,
        QuestionnaireEmail::class
    ];

    /**
     * @var string
     */
    private static $url_segment = 'questionnaire-admin';

    /**
     * @var string
     */
    private static $menu_title = 'Questionnaires';

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
        $config = GridFieldConfig_RelationEditor::create(250);
        $gridField->setConfig($config);

        return $form;
    }
}
