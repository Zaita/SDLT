<?php

/**
 * This file contains the "VendorPageController" class.
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
use SilverStripe\Control\HTTPRequest;
use SilverStripe\View\Requirements;
use SilverStripe\View\SSViewer;

/**
 * Class VendorPageController
 *
 */
class VendorPageController extends PageController
{
    /**
     * Pre-process
     * @return void
     */
    protected function init()
    {
        parent::init();

        Requirements::javascript('themes/sdlt/dist/js/main.bundle.js');
    }

    /**
     * @param HTTPRequest $request
     *
     * @return mixed
     */
    public function index(HTTPRequest $request)
    {
        return $this
            ->customise([
                'Layout' => SSViewer::execute_template('VendorTemplate', [])
            ])
            ->renderWith('Page');
    }
}
