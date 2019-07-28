<?php

namespace NZTA\SDLT\Form\GridField;

use SilverStripe\Forms\GridField\GridFieldEditButton;

/**
 * A button that allows a user to edit details of a record.
 */
class GridFieldCustomEditAction extends GridFieldEditButton
{
    /**
     * @inheritdoc
     * change the edit link
     */
    public function getUrl($gridField, $record, $columnName)
    {
        return $record->Link;
    }
}
