<?php

/**
 * This file contains the "SendDeniedNotificationEmailJob" class.
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
class SendDeniedNotificationEmailJob extends AbstractQueuedJob implements QueuedJob
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
            'Initialising denied notification email - %s (%d)',
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
        $emailDetails = QuestionnaireEmail::get()->first();
        $sub = $this->replaceVariable($emailDetails->DeniedNotificationEmailSubject);
        $from = $emailDetails->FromEmailAddress;

        $email = Email::create()
            ->setHTMLTemplate('Email\\EmailTemplate')
            ->setData([
                'Name' => $this->questionnaireSubmission->SubmitterName,
                'Body' => $this->replaceVariable($emailDetails->DeniedNotificationEmailBody),
                'EmailSignature' => $emailDetails->EmailSignature
            ])
            ->setFrom($from)
            ->setTo($member->Email)
            ->setSubject($sub);

        $email->send();

        $this->isComplete = true;
    }

    /**
     * @param string $string string
     * @return string
     */
    public function replaceVariable($string)
    {
        $questionnaireName = $this->questionnaireSubmission->Questionnaire()->Name;

        $string = str_replace('{$questionnaireName}', $questionnaireName, $string);

        return $string;
    }
}
