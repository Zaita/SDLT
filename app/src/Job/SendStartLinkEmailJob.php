<?php

/**
 * This file contains the "SendStartLinkEmailJob" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T.
 * @copyright 2019 New Zealand Transport Agency
 * @license https://nzta.govt.nz (BSD-3)
 * @link https://nzta.govt.nz
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
            'Initialising start link email %s (%d)',
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
        $emailDetails = QuestionnaireEmail::get()->First();

        $sub = $this->replaceVariable($emailDetails->StartLinkEmailSubject);
        $from = $emailDetails->FromEmailAddress;
        $to = $this->questionnaireSubmission->SubmitterEmail;

        $email = Email::create()
            ->setHTMLTemplate('Email\\EmailTemplate')
            ->setData([
                'SubmitterName' => $this->questionnaireSubmission->SubmitterName,
                'Body' => $this->replaceVariable($emailDetails->StartLinkEmailBody),
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
        $link = $this->questionnaireSubmission->getStartLink();
        $startLink = '<a href="' . $link . '">this link</a>';

        $string = str_replace('{$questionnaireName}', $questionnaireName, $string);
        $string = str_replace('{$startLink}', $startLink, $string);

        return $string;
    }
}
