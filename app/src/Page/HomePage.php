<?php

/**
 * This file contains the "HomePage" class.
 *
 * @category SilverStripe_Project
 * @package MoeCpt
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace SDLT\Page;

use Page;
use SDLT\Controller\HomePageController;

/**
 * Class HomePage
 *
 */
class HomePage extends Page
{
    public function getControllerName()
    {
        return HomePageController::class;
    }

}
