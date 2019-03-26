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
     * @param array                   $members                 members id list
     */
    public function __construct($questionnaireSubmission = null, $members = [])
    {
        $this->questionnaireSubmission = $questionnaireSubmission;
        $this->Member = $members;
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
        foreach ($this->Member as $memberId) {
            $member = Member::get()->byID($memberId);
            if ($member) {
                $this->sendEmail($member);
            }
        }

        $this->isComplete = true;
    }

    /**
     * @param DataObject $member Member
     *
     * @return null
     */
    public function sendEmail($member)
    {
        $emailDetails = QuestionnaireEmail::get()->first();

        $sub = $this->replaceVariable($emailDetails->ApprovalLinkEmailSubject);
        $from = $emailDetails->FromEmailAddress;

        $email = Email::create()
            ->setHTMLTemplate('Email\\EmailTemplate')
            ->setData([
                'Name' => $member->FirstName,
                'Body' => $this->replaceVariable($emailDetails->ApprovalLinkEmailBody),
                'EmailSignature' => $emailDetails->EmailSignature

            ])
            ->setFrom($from)
            ->setTo($member->Email)
            ->setSubject($sub);

        $email->send();
    }

    /**
     * @param string $string string
     * @return string
     */
    public function replaceVariable($string)
    {
        $questionnaireName = $this->questionnaireSubmission->Questionnaire()->Name;
        $SubmitterName = $this->questionnaireSubmission->SubmitterName;
        $SubmitterEmail = $this->questionnaireSubmission->SubmitterEmail;
        $link = $this->questionnaireSubmission->getSummaryPageLink();
        $summaryLink = '<a href="' . $link . '">this link</a>';

        $string = str_replace('{$questionnaireName}', $questionnaireName, $string);
        $string = str_replace('{$summaryLink}', $summaryLink, $string);
        $string = str_replace('{$submitterName}', $SubmitterName, $string);
        $string = str_replace('{$submitterEmail}', $SubmitterEmail, $string);

        return $string;
    }
}
