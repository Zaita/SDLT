<?php

/**
 * This file contains the "SendStartLinkEmailJob" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright NZ Transport Agency
 * @license BSD-3
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Job;

use SilverStripe\Control\Email\Email;
use Symbiote\QueuedJobs\Services\AbstractQueuedJob;
use Symbiote\QueuedJobs\Services\QueuedJobService;
use Symbiote\QueuedJobs\Services\QueuedJob;
use NZTA\SDLT\Model\QuestionnaireEmail;

/**
 * A QueuedJob is specifically designed to be invoked from an onAfterWrite() process
 */
class SendSummaryPageLinkEmailJob extends AbstractQueuedJob implements QueuedJob
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
            'Initialising summary link email job for %s (%d)',
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
        $emailDetails = QuestionnaireEmail::get()->first();

        $sub = $this->replaceVariable($emailDetails->SummaryLinkEmailSubject);
        $from = $emailDetails->FromEmailAddress;
        $to = $this->questionnaireSubmission->SubmitterEmail;

        $email = Email::create()
            ->setHTMLTemplate('Email\\EmailTemplate')
            ->setData([
                'Name' => $this->questionnaireSubmission->SubmitterName,
                'Body' => $this->replaceVariable($emailDetails->SummaryLinkEmailBody),
                'EmailSignature' => $emailDetails->EmailSignature
            ])
            ->setFrom($from)
            ->setTo($to)
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
        $link = $this->questionnaireSubmission->getSummaryPageLink();
        $productName = $this->questionnaireSubmission->ProductName;
        $summaryLink = '<a href="' . $link . '">this link</a>';

        $string = str_replace('{$questionnaireName}', $questionnaireName, $string);
        $string = str_replace('{$summaryLink}', $summaryLink, $string);
        $string = str_replace('{$productName}', $productName, $string);

        return $string;
    }
}
