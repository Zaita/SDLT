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
use NZTA\SDLT\Model\QuestionnaireEmail;
use NZTA\SDLT\Constant\UserGroupConstant;
use SilverStripe\Security\Member;

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
            $isSendEmailToSA = $this->questionnaireSubmission->isSAApprovalPending();
            $isSendEmailToCiso = $this->questionnaireSubmission->isCisoApprovalPending();

            foreach ($this->members as $member) {
                $memberRole = '';
                if ($isSendEmailToSA && $member->getIsSA()) {
                    $memberRole = UserGroupConstant::ROLE_CODE_SA;
                } else if ($isSendEmailToCiso && $member->getIsCISO()) {
                    $memberRole = UserGroupConstant::ROLE_CODE_CISO;
                }

                if (!$memberRole) {
                    continue;
                }

                $this->sendEmail($member->FirstName, $member->Email, false, $memberRole);
            }
        }

        // send email to the business owner
        if ($this->businessOwnerEmail != '') {
            $name = $this->questionnaireSubmission->getBusinessOwnerApproverName() ?: 'Business Owner';

            $this->sendEmail($name, $this->businessOwnerEmail, true, UserGroupConstant::ROLE_CODE_BO);
        }
    }

    /**
     * @param string  $name            Name
     * @param string  $toEmail         The "To" Email address
     * @param boolean $isBusinessOwner Is current "user" a "BusinessOwner" type?
     * @param string  $memberRole      Member type. This will use the correct email
     *                                 template fields.
     * @return null
     */
    public function sendEmail($name = '', $toEmail = '', $isBusinessOwner = false, $memberRole)
    {
        $emailDetails = QuestionnaireEmail::get()->first();
        $subjField = "{$memberRole}ApprovalLinkEmailSubject";
        $bodyField = "{$memberRole}ApprovalLinkEmailBody";
        $subject = $this->replaceVariable($emailDetails->$subjField, $isBusinessOwner);
        $body = $this->replaceVariable($emailDetails->$bodyField, $isBusinessOwner);
        $from = $emailDetails->FromEmailAddress;
        $email = Email::create()
            ->setHTMLTemplate('Email\\EmailTemplate')
            ->setData([
                'Name' => $name,
                'Body' => $body,
                'EmailSignature' => $emailDetails->EmailSignature

            ])
            ->setFrom($from)
            ->setTo($toEmail)
            ->setSubject($subject);

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
