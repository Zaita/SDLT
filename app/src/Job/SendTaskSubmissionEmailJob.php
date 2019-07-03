<?php

/**
 * This file contains the "SendTaskSubmissionEmailJob" class.
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
use NZTA\SDLT\Model\QuestionnaireEmail;

/**
 * A QueuedJob is specifically designed to be invoked from an onAfterWrite() process
 */
class SendTaskSubmissionEmailJob extends AbstractQueuedJob implements QueuedJob
{
    /**
     * @param TaskSubmission $taskSubmission taskSubmission
     * @param DataObject     $members        members
     */
    public function __construct($taskSubmission = null, $members = [])
    {
        $this->taskSubmission = $taskSubmission;
        $this->members = $members;
    }

    /**
     * @return string
     */
    public function getTitle()
    {
        return sprintf(
            'Initialising task submission email for - %s (%d)',
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
        // send email to stack holder (CISO and Security Architect group)
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
            $sub = $this->replaceVariable($emailDetails->EmailSubject);
            $from = $emailDetails->FromEmailAddress;

            $email = Email::create()
                ->setHTMLTemplate('Email\\EmailTemplate')
                ->setData([
                    'Name' => $name,
                    'Body' => $this->replaceVariable($emailDetails->EmailBody, $emailDetails->LinkPrefix),
                    'EmailSignature' => $emailDetails->EmailSignature
                ])
                ->setFrom($from)
                ->setTo($toEmail)
                ->setSubject($sub);

            $email->send();
        }
    }

    /**
     * @param string $string     string
     * @param string $linkPrefix prefix before the link
     * @return string
     */
    public function replaceVariable($string = '', $linkPrefix = '')
    {
        $taskName = $this->taskSubmission->Task()->Name;
        $SubmitterName = $this->taskSubmission->Submitter()->Name;
        $SubmitterEmail = $this->taskSubmission->Submitter()->SubmitterEmail;

        if ($linkPrefix) {
            $link = $this->taskSubmission->AnonymousAccessLink($linkPrefix);
        } else {
            $link = $this->taskSubmission->SecureLink();
        }


        $string = str_replace('{$taskName}', $taskName, $string);
        $string = str_replace('{$taskLink}', $link, $string);
        $string = str_replace('{$submitterName}', $SubmitterName, $string);
        $string = str_replace('{$submitterEmail}', $SubmitterEmail, $string);

        return $string;
    }
}
