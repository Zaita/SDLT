<?php

/**
 * This file contains the "BusinessOwnerApprovalPageController" class.
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
     * @param HTTPRequest $request HTTPRequest $request
     *
     * @return HTTPResponse
     */
    public function index(HTTPRequest $request)
    {
        $this->redirect('/', 302);
    }
}
