<?php

/**
 * This file contains the "GridFieldTitleHeader" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Forms\GridField;

use SilverStripe\Forms\GridField\GridField_HTMLProvider;
use SilverStripe\ORM\ArrayList;
use SilverStripe\View\ArrayData;

/**
 * A simple header which displays column titles.
 */
class GridFieldTitleHeader implements GridField_HTMLProvider
{
    public function getHTMLFragments($grid)
    {
        $cols = new ArrayList();
        foreach ($grid->getColumns() as $name) {
            $meta = $grid->getColumnMetadata($name);
            $cols->push(new ArrayData(array(
                'Name'  => $name,
                'Title' => $meta['title']
            )));
        }
        return array(
            'header' => $cols->renderWith(__CLASS__)
        );
    }
}
