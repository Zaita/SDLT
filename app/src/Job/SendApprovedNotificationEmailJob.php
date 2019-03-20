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

/**
 * A QueuedJob is specifically designed to be invoked from an onAfterWrite() process
 */
class SendApprovedNotificationEmailJob extends AbstractQueuedJob implements QueuedJob
{
    /**
     * @param QuestionnaireSubmission $questionnaireSubmission $questionnaireSubmission
     */
    public function __construct($questionnaireSubmission = null)
    {
        $this->questionnaireSubmission = $questionnaireSubmission;
    }

    /**
      * @return string
      */
    public function getTitle()
    {
        return sprintf(
            'Initialising approved email notification - %s (%d)',
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
        $isSendNotificaton = $this->questionnaireSubmission->SendApprovedNotificatonToSecurityArchitect;

        //@todo :get list of SecurityArchitect to send approved notification;
        if ($isSendNotificaton) {
          // get member socket_create_listen

          // send email notificaton
        }

        // send email to the user
        if ($member = $this->questionnaireSubmission->User()) {
            $this->sendEmail($member, $approver);
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
        $sub = $this->questionnaireSubmission->Questionnaire()->Name . '- is approved.';
        $from = 'no-reply@nzta.govt.nz';

        $email = Email::create()
            ->setHTMLTemplate('Email\\NotificationEmailOnApproved')
            ->setData([
                'Name' => $member->FirstName,
                'Link'=> $this->questionnaireSubmission->getSummaryPageLink(),
                'QuestionnaireName' => $this->questionnaireSubmission->Questionnaire()->Name
            ])
            ->setFrom($from)
            ->setTo($member->Email)
            ->setSubject($sub);

        $email->send();
    }
}
