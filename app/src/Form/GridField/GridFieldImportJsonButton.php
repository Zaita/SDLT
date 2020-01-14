<?php
/**
 * This file contains the "GridFieldImportJsonButton".
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2020 <silverstripedev@catalyst.net.nz>
 * @copyright 2020 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Form\GridField;

use SilverStripe\Forms\GridField\GridField_HTMLProvider;
use SilverStripe\Forms\GridField\GridField_FormAction;
use SilverStripe\Forms\GridField\GridFieldImportButton;
use SilverStripe\View\SSViewer;
use SilverStripe\View\ArrayData;

/**
 * Class GridFieldImportJsonButton
 * Json file import button
 */
class GridFieldImportJsonButton extends GridFieldImportButton
{
    /**
     * Import form
     *
     * @var Form
     */
    protected $importJsonForm;

    /**
     * Place the export button in a <p> tag below the field
     *
     * @param GridField $gridField gird
     * @return array
     */
    public function getHTMLFragments($gridField)
    {
        $modalID = $gridField->ID() . '_ImportModal';

        // Check for form message prior to rendering form (which clears session messages)
        $form = $this->getImportJsonForm();
        $hasMessage = $form && $form->getMessage();

        // Render modal
        $template = SSViewer::get_templates_by_class(static::class, '_Modal');
        $viewer = new ArrayData([
            'ImportModalTitle' => $this->getModalTitle(),
            'ImportModalID' => $modalID,
            'ImportIframe' => $this->getImportIframe(),
            'ImportForm' => $form,
        ]);
        $modal = $viewer->renderWith($template)->forTemplate();

        // Build action button
        $button = new GridField_FormAction(
            $gridField,
            'import',
            'Import',
            'import',
            null
        );
        $button
            ->addExtraClass('btn btn-secondary font-icon-upload btn--icon-large action_import')
            ->setForm($gridField->getForm())
            ->setAttribute('data-toggle', 'modal')
            ->setAttribute('aria-controls', $modalID)
            ->setAttribute('data-target', "#{$modalID}")
            ->setAttribute('data-modal', $modal);

        // If form has a message, trigger it to automatically open
        if ($hasMessage) {
            $button->setAttribute('data-state', 'open');
        }

        return array(
            $this->targetFragment => $button->Field()
        );
    }

    /**
     * get Import from Json Form
     *
     * @return Form
     */
    public function getImportJsonForm()
    {
        return $this->importJsonForm;
    }

    /**
     * set Import from Json Form
     *
     * @param Form $importJsonForm import json form
     * @return $this
     */
    public function setImportJsonForm($importJsonForm)
    {
        $this->importJsonForm = $importJsonForm;
        return $this;
    }
}
