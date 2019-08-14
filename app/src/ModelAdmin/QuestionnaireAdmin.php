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
use NZTA\SDLT\Model\Risk;
use NZTA\SDLT\Model\ImpactThreshold;
use NZTA\SDLT\Traits\SDLTAdminCommon;
use SilverStripe\Admin\ModelAdmin;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\GridField\GridFieldImportButton;
use SilverStripe\Forms\GridField\GridFieldExportButton;
use SilverStripe\Forms\GridField\GridFieldPrintButton;

/**
 * Class QuestionnaireAdmin
 *
 * This class is used to manage Questionnaires and Tasks
 */
class QuestionnaireAdmin extends ModelAdmin
{
    use SDLTAdminCommon;

    /**
     * @var string[]
     */
    private static $managed_models = [
        Dashboard::class,
        Questionnaire::class,
        Task::class,
        QuestionnaireEmail::class,
        Risk::class,
        ImpactThreshold::class,
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
        $config = $gridField->getConfig();
        $config->removeComponent($config->getComponentByType(GridFieldPrintButton::class));

        if (!$this->modelClass::config()->get('show_import_button')) {
            $config->removeComponent($config->getComponentByType(GridFieldImportButton::class));
        }

        if (!$this->modelClass::config()->get('show_export_button')) {
            $config->removeComponent($config->getComponentByType(GridFieldExportButton::class));
        }

        $gridField->setConfig($config);

        return $form;
    }
}
