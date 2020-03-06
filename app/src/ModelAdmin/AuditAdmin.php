<?php

/**
 * This file contains the "AuditAdmin" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright NZ Transport Agency
 * @license BSD-3
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\ModelAdmin;

use SilverStripe\Admin\ModelAdmin;
use SilverStripe\Forms\GridField\GridFieldAddNewButton;
use SilverStripe\Forms\GridField\GridFieldPrintButton;
use NZTA\SDLT\Model\AuditEvent;

/**
 * Basic {@link ModelAdmin} implementation for managing and reviewing audit-logging
 * generated via {@link AuditService} and {@link AuditEvent}.
 */
class AuditAdmin extends ModelAdmin
{
    /**
     * @var string
     */
    private static $url_segment = 'audit';

    /**
     * @var string
     */
    private static $menu_title = 'Audit';

    /**
     * @var string[]
     */
    private static $managed_models = [
        AuditEvent::class,
    ];

    /**
     * @var boolean
     */
    public $showImportForm = false;

    /**
     * @param  int       $id     (Inherited).
     * @param  FieldList $fields (Inherited).
     * @return FieldList
     */
    public function getEditForm($id = null, $fields = null)
    {
        $form = parent::getEditForm($id = null, $fields = null);

        $gridField = $form->Fields()->dataFieldByName($this->sanitiseClassName($this->modelClass));
        // Remove "Add Event" button.
        $gridField
                ->getConfig()
                ->removeComponentsByType([
                    GridFieldAddNewButton::class,
                    GridFieldPrintButton::class
                ]);
        // Ensure consistent sort order
        $gridField->setList($gridField->getList()->sort('Created DESC'));

        return $form;
    }
}
