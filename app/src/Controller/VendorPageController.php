<?php

/**
 * This file contains the "VendorPageController" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T.
 * @copyright 2019 New Zealand Transport Agency
 * @license https://nzta.govt.nz (BSD-3)
 * @link https://nzta.govt.nz
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
