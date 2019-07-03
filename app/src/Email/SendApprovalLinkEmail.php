<?php

/**
 * This file contains the "SendApprovalLinkEmail" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Email;

use SilverStripe\Control\Email\Email;
use Symbiote\QueuedJobs\Services\AbstractQueuedJob;
use Symbiote\QueuedJobs\Services\QueuedJobService;
use Symbiote\QueuedJobs\Services\QueuedJob;
use SilverStripe\Security\Member;
use NZTA\SDLT\Model\QuestionnaireEmail;

/**
 * Send Approval Link Email
 */
class SendApprovalLinkEmail
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
        $this->approvalLinkEmail();
    }

    /**
     * @return mixed void | null
     */
    public function approvalLinkEmail()
    {
        // send email to CISO or Security Architect group
        if ($this->members) {
            foreach ($this->members as $member) {
                $this->sendEmail($member->FirstName, $member->Email, false);
            }
        }

        if ($this->businessOwnerEmail != '') {
            $this->sendEmail('Business Owner', $this->businessOwnerEmail, true);
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
    public function sendEmail($name = '', $toEmail = '', $isBusinessOwner = false)
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
        $productName = $this->questionnaireSubmission->ProductName;

        $link = $this->questionnaireSubmission->getSummaryPageLink();

        if ($isBusinessOwner) {
            $link = $this->questionnaireSubmission->getApprovalPageLink();
        }

        $approvalLink = '<a href="' . $link . '">this link</a>';

        $string = str_replace('{$questionnaireName}', $questionnaireName, $string);
        $string = str_replace('{$approvalLink}', $approvalLink, $string);
        $string = str_replace('{$submitterName}', $SubmitterName, $string);
        $string = str_replace('{$submitterEmail}', $SubmitterEmail, $string);
        $string = str_replace('{$productName}', $productName, $string);

        return $string;
    }
}
