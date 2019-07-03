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
use NZTA\SDLT\Email\SendApprovalLinkEmail;

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
        new SendApprovalLinkEmail($this->questionnaireSubmission, $this->members, $this->businessOwnerEmail);

        $this->isComplete = true;
    }
}
