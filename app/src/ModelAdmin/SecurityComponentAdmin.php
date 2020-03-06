<?php

/**
 * This file contains the "SecurityComponentAdmin" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright NZ Transport Agency
 * @license BSD-3
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\ModelAdmin;

use NZTA\SDLT\Model\SecurityComponent;
use NZTA\SDLT\Model\SecurityControl;
use SilverStripe\Admin\ModelAdmin;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridFieldConfig_RelationEditor;
use SilverStripe\Forms\GridField\GridFieldViewButton;
use NZTA\SDLT\Traits\SDLTAdminCommon;
use SilverStripe\Forms\GridField\GridFieldImportButton;
use SilverStripe\Forms\GridField\GridFieldExportButton;
use SilverStripe\Forms\GridField\GridFieldPrintButton;
use NZTA\SDLT\Form\GridField\GridFieldImportJsonButton;
use SilverStripe\Forms\GridField\GridFieldDetailForm;

/**
 * Class SecurityComponentAdmin
 *
 */
class SecurityComponentAdmin extends ModelAdmin
{
    use SDLTAdminCommon;

    /**
     * @var string[]
     */
    private static $managed_models = [
        SecurityComponent::class,
        SecurityControl::class,
    ];

    /**
     * @var string
     */
    private static $url_segment = 'security-components-admin';

    /**
     * @var string
     */
    private static $menu_title = 'Security Components';

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

        // if grid is SecurityControl, then hide the display for control weight set
        // only display the fields related to SecurityControl
        if ($gridFieldName == "NZTA-SDLT-Model-SecurityControl") {
            $detailForm = $config->getComponentByType(GridFieldDetailForm::class);

            $securityControlFields = singleton($this->modelClass)->getCMSFields();

            if ($securityControlFields) {
                $securityControlFields->removeByName([
                    'ControlWeightSets'
                ]);
            }

            $detailForm->setFields($securityControlFields);
        }

        $config->removeComponent($config->getComponentByType(GridFieldPrintButton::class));

        if (!$this->modelClass::config()->get('show_import_button')) {
            $config->removeComponent($config->getComponentByType(GridFieldImportButton::class));
        }

        if (!$this->modelClass::config()->get('show_export_button')) {
            $config->removeComponent($config->getComponentByType(GridFieldExportButton::class));
        }

        // show json import button only for the model has "canImport" method
        // and user has permission to canImport (set in CMS with user group permission)
        if (singleton($this->modelClass)->hasMethod('canImport') &&
            singleton($this->modelClass)->canImport()) {
            $config->addComponent(
                GridFieldImportJsonButton::create('buttons-before-left')
                    ->setImportJsonForm($this->ImportJsonForm())
                    ->setModalTitle('Import from Json')
            );
        }

        $gridField->setConfig($config);

        return $form;
    }
}
