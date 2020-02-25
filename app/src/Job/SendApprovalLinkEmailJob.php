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

use Symbiote\QueuedJobs\Services\AbstractQueuedJob;
use Symbiote\QueuedJobs\Services\QueuedJob;
use SilverStripe\ORM\ManyManyList;
use NZTA\SDLT\Model\QuestionnaireSubmission;
use NZTA\SDLT\Email\SendApprovalLinkEmail;

/**
 * A QueuedJob is specifically designed to be invoked from an onAfterWrite() process
 */
class SendApprovalLinkEmailJob extends AbstractQueuedJob implements QueuedJob
{
    /**
     * @param  QuestionnaireSubmission $questionnaireSubmission A questionnaireSubmission record.
     * @param  ManyManyList            $members                 A list of {@link Member} records.
     * @param  string                  $businessOwnerEmail      A business owner email address.
     * @return void
     */
    public function __construct(QuestionnaireSubmission $questionnaireSubmission = null, $members = null, $businessOwnerEmail = '')
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
        new SendApprovalLinkEmail($this->questionnaireSubmission, $this->members, $this->businessOwnerEmail);

        $this->isComplete = true;
    }
}
