<?php

/**
 * This file contains the "BusinessOwnerApprovalPageController" class.
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
use SilverStripe\View\Requirements;
use SilverStripe\Control\Controller;
use SilverStripe\Control\HTTPRequest;
use SilverStripe\View\SSViewer;

/**
 * Class BusinessOwnerApprovalPageController
 *
 */
class BusinessOwnerApprovalPageController extends PageController
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
     * @param HTTPRequest $request HTTPRequest $request
     *
     * @return HTTPResponse
     */
    public function index(HTTPRequest $request)
    {
        return $this->customise([
            'Layout' => SSViewer::execute_template('BusinessOwnerApprovalTemplate', [])
        ])->renderWith('Page');
    }
}
