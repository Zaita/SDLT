<?php

use SilverStripe\Dev\SapphireTest;
use SilverStripe\Core\Config\Config;
use SilverStripe\Core\Injector\Injector;
use NZTA\SDLT\IssueTracker\IssueTrackerSystem;
use NZTA\SDLT\Test\MockIssueTracker;

/**
 * Tests aspects of {@link SecurityComponent} logic.
 */
class IssueTrackerSystemTest extends SapphireTest
{
    public function test_factory_no_provider()
    {
        Config::nest();
        Config::modify()->set(IssueTrackerSystem::class, 'provider', null);

        $this->expectException('Exception');
        $this->expectExceptionMessage('Please configure the SDLT with a valid ticket system provider.');

        Injector::inst()->create('IssueTrackerService');

        Config::unnest();
    }

    public function test_factory_bad_provider()
    {
        Config::nest();
        Config::modify()->set(IssueTrackerSystem::class, 'provider', 'foo\bar\baz');

        $this->expectException('Exception');
        $this->expectExceptionMessage('No issue tracker provider called "foo\bar\baz" was found.');

        Injector::inst()->create('IssueTrackerService');

        Config::unnest();
    }

    public function test_factory_good_instance()
    {
        Config::nest();
        Config::modify()->set(IssueTrackerSystem::class, 'provider', MockIssueTracker::class);

        $this->assertInstanceOf(IssueTrackerSystem::class, Injector::inst()->create('IssueTrackerService'));

        Config::unnest();
    }
}
