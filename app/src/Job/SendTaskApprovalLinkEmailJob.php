<?php

/**
 * This file contains the "SendTaskApprovalLinkEmailJob" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Job;

use SilverStripe\Control\Email\Email;
use Symbiote\QueuedJobs\Services\AbstractQueuedJob;
use Symbiote\QueuedJobs\Services\QueuedJobService;
use Symbiote\QueuedJobs\Services\QueuedJob;
use SilverStripe\Security\Member;
use NZTA\SDLT\Model\TaskSubmission;
use NZTA\SDLT\Model\Task;

/**
 * A QueuedJob is specifically designed to be invoked from an onAfterWrite() process
 */
class SendTaskApprovalLinkEmailJob extends AbstractQueuedJob implements QueuedJob
{
    /**
     * @param TaskSubmission $submission task submission
     * @param Member         $members    member
     */
    public function __construct($submission = null, $members = [])
    {
        $this->taskSubmission = $submission;
        $this->members = $members;
    }

    /**
     * @return string
     */
    public function getTitle()
    {
        return sprintf(
            'Initialising task approval link email for - %s (%d)',
            $this->taskSubmission->Task()->Name,
            $this->taskSubmission->ID
        );
    }

    /**
     * {@inheritDoc}
     * @return string
     */
    public function getJobType()
    {
        return QueuedJob::QUEUED;
    }

    /**
     * @return mixed void | null
     */
    public function process()
    {
        foreach ($this->members as $member) {
            $this->sendEmail($member->FirstName, $member->Email);
        }

        $this->isComplete = true;
    }

    /**
     * @param string $name    name
     * @param string $toEmail to Email
     *
     * @return null
     */
    public function sendEmail($name = '', $toEmail = '')
    {
        foreach ($this->taskSubmission->Task()->SubmissionEmails() as $emailDetails) {
            $sub = $this->replaceVariable($emailDetails->ApprovalLinkEmailSubject);
            $from = $emailDetails->FromEmailAddress;

            $email = Email::create()
                ->setHTMLTemplate('Email\\EmailTemplate')
                ->setData([
                    'Name' => $name,
                    'Body' => $this->replaceVariable($emailDetails->ApprovalLinkEmailBody, $emailDetails->LinkPrefix),
                    'EmailSignature' => $emailDetails->EmailSignature
                ])
                ->setFrom($from)
                ->setTo($toEmail)
                ->setSubject($sub);

            $email->send();
        }
    }

    /**
     * @param string $string string
     * @return string
     */
    public function replaceVariable($string = '')
    {
        $taskName = $this->taskSubmission->Task()->Name;
        $submitterName = $this->taskSubmission->Submitter()->Name;
        $submitterEmail = $this->taskSubmission->Submitter()->Email;
        $link = $this->taskSubmission->SecureLink();

        $string = str_replace('{$taskName}', $taskName, $string);
        $string = str_replace('{$taskLink}', $link, $string);
        $string = str_replace('{$submitterName}', $submitterName, $string);
        $string = str_replace('{$submitterEmail}', $submitterEmail, $string);

        return $string;
    }
}
