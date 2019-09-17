<?php

use SilverStripe\Dev\SapphireTest;
use SilverStripe\Core\Config\Config;
use NZTA\SDLT\IssueTracker\JIRA\JIRA;
use NZTA\SDLT\IssueTracker\IssueTrackerSystem;
use NZTA\SDLT\IssueTracker\IssueTrackerTicket;
use SilverStripe\Core\Injector\Injector;

/**
 * Tests aspects of the {@link JIRA} API implementation.
 */
class JIRAIssueV2Test extends SapphireTest
{
    /**
     * This test should really assert at a more fine-grained level that all
     * methods work as designed. At the moment, we're simply asserting that
     * the top-level compose() method works with known inputs.
     */
    public function testCompose()
    {
        Config::nest();
        Config::modify()->set(IssueTrackerSystem::class, 'provider', JIRA::class);
        Config::modify()->set(IssueTrackerTicket::class, 'api_version', 2);

        $fixture = file_get_contents(__DIR__ . '/../fixtures/json/jira-issue-task-apiv2.json');
        $issue = Injector::inst()->create('IssueTrackerService')->issue()
                ->setProjectKey('TEST')
                ->setSummaryText('This is a summary')
                ->setIssueType('Task')
                ->setDescriptionText("{panel:title=(on) Instruction|bgColor=#FFFFCE}The product will authenticate some Staff.{panel}\t\n*Staff User Login*\n\n\t* *(x) Foo Integration*\n\t\tThis product integrates with Foo TEST #1\n\n\t* *(x) Bar Integration*\n\t\tThis product integrates with Bar TEST #2\n");
        $expected = json_decode($fixture, true);
        $actual = json_decode($issue->compose(), true);

        $this->assertEquals($expected, $actual);

        Config::unnest();
    }

    public function testNormaliseListItemIsBad()
    {
        Config::nest();
        Config::modify()->set(IssueTrackerSystem::class, 'provider', JIRA::class);
        Config::modify()->set(IssueTrackerTicket::class, 'api_version', 2);

        $this->expectException(\InvalidArgumentException::class);

        $issue = Injector::inst()->create('IssueTrackerService')->issue();

        $issue::normalise_list_item('This is a title', ['This is not a title']);

        Config::unnest();
    }

    public function testNormaliseListItemIsOK()
    {
        Config::nest();
        Config::modify()->set(IssueTrackerSystem::class, 'provider', JIRA::class);
        Config::modify()->set(IssueTrackerTicket::class, 'api_version', 2);

        $issue = Injector::inst()->create('IssueTrackerService')->issue();

        $this->assertEquals("\t* *(x) This is a title*\n\t\tThis is not a title\n", $issue::normalise_list_item(
            'This is a title',
            'This is not a title'
        ));

        Config::unnest();
    }
}
