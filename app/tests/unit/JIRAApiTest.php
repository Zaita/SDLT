<?php

use SilverStripe\Dev\SapphireTest;
use NZTA\SDLT\Model\SecurityControl;
use NZTA\SDLT\IssueTracker\JIRA\JIRA;
use NZTA\SDLT\Model\TaskSubmission;

/**
 * Tests aspects of the {@link JIRA} API implementation. These test that locally
 * stored (saved) {@link SecurityComponent} and their related {@link SecurityControl}
 * records are updated against a known (canned) JIRA API response.
 */
class JIRAApiTest extends SapphireTest
{
    /**
     * @var boolean
     */
    protected $usesDatabase = true;

    /**
     * @var string
     */
    protected static $fixture_file = 'app/tests/fixtures/JIRAApiTest.yml';

    public function testGetControlDetailsFromJiraTicketBadResponseEmptyResponse()
    {
        // Configure the stub to return an empty response
        $stub = $this->createPartialMock(JIRA::class, ['call']);
        $stub->expects($this->any())
            ->method('call')
            ->willReturn('');

        $submission = $this->objFromFixture(TaskSubmission::class, 'submission');
        $ticket = $submission->JiraTickets()->first();

        // Empty response from API
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Unexpected API response: Bad response.');

        $stub->getControlDetailsFromJiraTicket($ticket);
    }

    public function testGetControlDetailsFromJiraTicketBadResponseMalformedBody()
    {
        // Configure the stub to return a dummy (bad) JSON response
        $stub = $this->createPartialMock(JIRA::class, ['call']);
        $stub->expects($this->any())
            ->method('call')
            ->willReturn('[{"badfields":"foo"}]');

        $submission = $this->objFromFixture(TaskSubmission::class, 'submission');
        $ticket = $submission->JiraTickets()->first();

        // Empty response from API
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Unexpected API response: Bad response body.');

        $stub->getControlDetailsFromJiraTicket($ticket);
    }

    public function testGetControlDetailsFromJiraTicketBadResponseMalformedEmoji()
    {
        // Configure the stub to return a dummy (bad) JSON response with an un-mapped emoji
        $cannedResponse = file_get_contents(__DIR__ . '/../fixtures/json/issue-component-unknown-emoji.json');
        $stub = $this->createPartialMock(JIRA::class, ['call']);
        $stub->expects($this->any())
            ->method('call')
            ->willReturn($cannedResponse);

        $submission = $this->objFromFixture(TaskSubmission::class, 'submission');
        $ticket = $submission->JiraTickets()->first();

        // Empty response from API
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Unexpected API response: Unmatched emoji.');

        $stub->getControlDetailsFromJiraTicket($ticket);
    }

    public function testGetControlDetailsFromJiraTicket()
    {
        // Configure the stub to return a dummy (good) JSON response
        $cannedResponse = file_get_contents(__DIR__ . '/../fixtures/json/issue-component.json');
        $stub = $this->createPartialMock(JIRA::class, ['call']);
        $stub->expects($this->any())
            ->method('call')
            ->willReturn($cannedResponse);

        $submission = $this->objFromFixture(TaskSubmission::class, 'submission');
        $ticket = $submission->JiraTickets()->first();

        $remoteControls = $stub->getControlDetailsFromJiraTicket($ticket);

        $this->assertEquals(3, count($remoteControls));
        foreach ($remoteControls as $remoteControl) {
          if ($remoteControl['ID'] === "44") {
            $this->assertEquals('Realised', $remoteControl['SelectedOption']);
          }
          if ($remoteControl['ID'] === "45") {
            $this->assertEquals('Intended', $remoteControl['SelectedOption']);
          }
          if ($remoteControl['ID'] === "46") {
            $this->assertEquals('Not Applicable', $remoteControl['SelectedOption']);
          }
        }
    }
}
