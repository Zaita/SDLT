<?php

/**
 * This file contains the "SendStartLinkEmailJob" class.
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

/**
 * A QueuedJob is specifically designed to be invoked from an onAfterWrite() process
 */
class SendStartLinkEmailJob extends AbstractQueuedJob implements QueuedJob
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
            'Initialising send email %s (%d)',
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
      * Handles the meat of the CSV import process.
      *
      * @return mixed void | null
      */
    public function process()
    {
        $sub = 'NZTA SDLT - ' . $this->questionnaireSubmission->Questionnaire()->Name . '- Link';
        $from = 'no-reply@nzta.govt.nz';
        $to = $this->questionnaireSubmission->SubmitterEmail;

        $email = Email::create()
            ->setHTMLTemplate('Email\\StartLinkEmail')
            ->setData([
                'SubmitterName' => $this->questionnaireSubmission->SubmitterName,
                'Link'=> $this->questionnaireSubmission->getSubmitterLink(),
                'QuestionnaireName' => $this->questionnaireSubmission->Questionnaire()->Name
            ])
            ->setFrom($from)
            ->setTo($to)
            ->setSubject($sub);


        $email->send();

        $this->isComplete = true;
    }
}
