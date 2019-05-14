<?php

/**
 * This file contains the "GraphQLTokenController" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T.
 * @copyright 2019 New Zealand Transport Agency
 * @license https://nzta.govt.nz (BSD-3)
 * @link https://nzta.govt.nz
 */

namespace NZTA\SDLT\Controller;

use SilverStripe\Security\SecurityToken;
use SilverStripe\Control\Controller;
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Security\Security;
use SilverStripe\Control\Email\Email;
use Symbiote\QueuedJobs\Services\QueuedJobService;
use NZTA\SDLT\Job\SendSubmitterLinkEmail;
use Silverstripe\Control\Director;

/**
 * Class GraphQLTokenController
 *
 */
class GraphQLTokenController extends Controller
{
    /**
     * @param HTTPRequest $request HTTPRequest $request
     *
     * @return HTTPResponse
     */
    public function index(HTTPRequest $request)
    {
        if (!$request->isAjax() || !$request->isGET()) {
            return "Sorry, no token available.";
        }

//        $member = Security::getCurrentUser();
//
//        // Check authentication
//        if (!$member) {
//            return "Please login.";
//        }

        $this->getResponse()->setBody(
            json_encode([
                'CSRFToken' => SecurityToken::inst()->getValue()
            ])
        );

        $this->getResponse()->addHeader("Content-type", "application/json");

        return $this->getResponse();
    }
}
