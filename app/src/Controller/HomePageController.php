<?php

/**
 * This file contains the "HomePageController" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Controller;

use PageController;
use SilverStripe\View\Requirements;

/**
 * Class HomePageController
 *
 */
class HomePageController extends PageController
{
    /**
     * Pre-process
     * @return void
     */
    protected function init()
    {
        parent::init();

        Requirements::javascript('themes/sdlt/dist/js/index.bundle.js');
    }
}
