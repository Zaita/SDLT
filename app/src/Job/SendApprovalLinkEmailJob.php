<?php

/**
 * This file contains the "SendApprovalLinkEmailJob" class.
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
class SendApprovalLinkEmailJob extends AbstractQueuedJob implements QueuedJob
{
    /**
     * @param QuestionnaireSubmission $questionnaireSubmission questionnaireSubmission
     * @param DataObject              $members                 members
     * @param DataObject              $businessOwnerEmail      business Owner Email
     */
    public function __construct($questionnaireSubmission = null, $members = [], $businessOwnerEmail = '')
    {
        $this->questionnaireSubmission = $questionnaireSubmission;
        $this->members = $members;
        $this->businessOwnerEmail = $businessOwnerEmail;
    }

    /**
     * @return string
     */
    public function getTitle()
    {
        return sprintf(
            'Initialising approval link email for - %s (%d)',
            $this->questionnaireSubmission->Questionnaire()->Name,
            $this->questionnaireSubmission->ID
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
            $this->sendEmail($member->FirstName, $member->Email, false);
        }

        if (!empty($this->businessOwnerEmail)) {
            $this->sendEmail('', $this->businessOwnerEmail, true);
        }

        $this->isComplete = true;
    }

    /**
     * @param string  $name            name
     * @param string  $toEmail         to Email
     * @param boolean $isBusinessOwner is BusinessOwner
     *
     * @return null
     */
    public function sendEmail($name, $toEmail, $isBusinessOwner = false)
    {
        $emailDetails = QuestionnaireEmail::get()->first();

        $sub = $this->replaceVariable($emailDetails->ApprovalLinkEmailSubject, $isBusinessOwner);
        $from = $emailDetails->FromEmailAddress;

        $email = Email::create()
            ->setHTMLTemplate('Email\\EmailTemplate')
            ->setData([
                'Name' => $name,
                'Body' => $this->replaceVariable($emailDetails->ApprovalLinkEmailBody, $isBusinessOwner),
                'EmailSignature' => $emailDetails->EmailSignature

            ])
            ->setFrom($from)
            ->setTo($toEmail)
            ->setSubject($sub);

        $email->send();
    }

    /**
     * @param string  $string          string
     * @param boolean $isBusinessOwner true/false
     * @return string
     */
    public function replaceVariable($string = '', $isBusinessOwner = false)
    {
        $questionnaireName = $this->questionnaireSubmission->Questionnaire()->Name;
        $SubmitterName = $this->questionnaireSubmission->SubmitterName;
        $SubmitterEmail = $this->questionnaireSubmission->SubmitterEmail;

        $link = $this->questionnaireSubmission->getSummaryPageLink();
        if ($isBusinessOwner) {
            $link = $this->questionnaireSubmission->getApprovalPageLink();
        }

        $approvalLink = '<a href="' . $link . '">this link</a>';

        $string = str_replace('{$questionnaireName}', $questionnaireName, $string);
        $string = str_replace('{$approvalLink}', $approvalLink, $string);
        $string = str_replace('{$submitterName}', $SubmitterName, $string);
        $string = str_replace('{$submitterEmail}', $SubmitterEmail, $string);

        return $string;
    }
}
