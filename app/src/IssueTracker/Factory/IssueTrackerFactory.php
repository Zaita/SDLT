<?php

/**
 * This file contains the "IssueTrackerServiceFactory" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright NZ Transport Agency
 * @license BSD-3
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\IssueTracker\Factory;

use SilverStripe\Core\Injector\Factory as DefaultInjectorFactory;
use NZTA\SDLT\IssueTracker\IssueTrackerSystem;

/**
 * A factory class for creating instances of {@link IssueTrackerSystem} services
 * via Injector.
 */
class IssueTrackerFactory implements DefaultInjectorFactory
{
    /**
     * Factory method to return an instance of {@link IssueTrackerSystem}.
     *
     * @return {@link IssueTrackerSystem}
     * @throws Exception When no ticket provider has been configured in YML config
     *                   or when the provided config isn't a valid PHP class.
     */
    public function create($service, array $params = [])
    {
        if (!$provider = IssueTrackerSystem::config()->get('provider')) {
            throw new \Exception('Please configure the SDLT with a valid ticket system provider.');
        }

        if (!class_exists($provider)) {
            throw new \Exception(sprintf('No issue tracker provider called "%s" was found.', $provider));
        }

        return $provider::create();
    }
}
