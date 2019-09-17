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
class JIRAIssueV3Test extends SapphireTest
{
    /**
     * This test should really assert at a more fine-grained level that all
     * methods work as designed. At the moment, we're simply asserting that
     * the top-level compose() method works with a set of known inputs.
     */
    public function testCompose()
    {
        Config::nest();
        Config::modify()->set(IssueTrackerSystem::class, 'provider', JIRA::class);
        Config::modify()->set(IssueTrackerTicket::class, 'api_version', 3);

        $fixture = file_get_contents(__DIR__ . '/../fixtures/json/jira-issue-task-apiv3.json');
        $issue = Injector::inst()->create('IssueTrackerService')->issue()
                ->setProjectKey('SDLT')
                ->setSummaryText('DLT Controls - COMPONENT X')
                ->setHeadingText('Instructions')
                ->setIssueType('Task')
                ->setEmail('security.architects@agency.govt.nz')
                ->setListItems([
                    ['CONTROL Y', 'This is the description of the control above'],
                ], true);

        // TODO Add public getters to IssueTrackerSystem and subclasses, so we can perform assertions
        // on getListItems(), getSummaryText() etc
        $this->assertEquals($fixture, $issue->compose());

        Config::unnest();
    }

    public function testNormaliseListItemIsBad()
    {
        Config::nest();
        Config::modify()->set(IssueTrackerSystem::class, 'provider', JIRA::class);
        Config::modify()->set(IssueTrackerTicket::class, 'api_version', 3);

        $this->expectException(\InvalidArgumentException::class);

        // We don't want arrays as unpacked arguments to normaliseListItem()
        $issue = Injector::inst()->create('IssueTrackerService')->issue();
        $issue::normalise_list_item('This is a title', ['This is not a title']);

        Config::unnest();
    }

    public function testNormaliseListItemIsOK()
    {
        Config::nest();
        Config::modify()->set(IssueTrackerSystem::class, 'provider', JIRA::class);
        Config::modify()->set(IssueTrackerTicket::class, 'api_version', 3);

        $issue = Injector::inst()->create('IssueTrackerService')->issue();
        $expected = '[{"type":"paragraph","content":[{"type":"emoji","attrs":{"shortName":":cross_mark:"}},{"type":"text","text":"  CONTROL Y","marks":[{"type":"strong"}]}]' .
                '},{"type":"paragraph","content":[{"type":"text","text":"    "},' .
                '{"type":"text","text":"All about CONTROL Y"}]}]';

        $this->assertEquals($expected, $issue::normalise_list_item(
            'CONTROL Y',
            'All about CONTROL Y'
        ));

        Config::unnest();
    }
}
