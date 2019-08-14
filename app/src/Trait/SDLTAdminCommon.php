<?php

/**
 * This file contains the "SDLTAdminCommon" trait.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright 2019 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Traits;

trait SDLTAdminCommon
{
    /**
     * Allow individual data-models to declare independent config for export fields
     * without polluting what appears in a GridField via $summary_fields.
     *
     * @return array
     */
    public function getExportFields(): array
    {
        $summaryFields = $this->modelClass::config()->get('summary_fields') ?? [];
        $extraFields = $this->modelClass::config()->get('extra_export_fields') ?? [];

        if ($extraFields) {
            return array_merge($summaryFields, $extraFields);
        }

        return $summaryFields;
    }
}