<?php

/**
 * This file contains the "CheckSubmissionExpiredJob" class.
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
use Symbiote\QueuedJobs\Services\QueuedJobService;
use NZTA\SDLT\Model\QuestionnaireSubmission;
use NZTA\SDLT\Model\TaskSubmission;
use NZTA\SDLT\Model\Questionnaire;
use SilverStripe\Core\Injector\Injector;

/**
 * A QueuedJob is specifically designed to be invoked at midnight everyday regularly
 */
class CheckSubmissionExpiredJob extends AbstractQueuedJob implements QueuedJob
{
    /**
     * @return string
     */
    public function getTitle()
    {
        return sprintf(
            'Initialising CheckSubmissionExpired Job'
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
     * @return void
     */
    public function process()
    {
        $questionnaireInProgress = QuestionnaireSubmission::get()
        ->filter([
            'QuestionnaireStatus'=> 'in_progress',
            'Questionnaire.ExpireAfterDays:GreaterThanOrEqual'
            => Questionnaire::config()->min_expiry_days
        ]);

        $questionnaireInProgress->each(function (QuestionnaireSubmission $submission) {
            $allowedToExpire = 'No';
            $questionnaire = $submission->Questionnaire();

            if ($submission && $submission->exists() && $questionnaire) {
                $allowedToExpire = $questionnaire->DoesSubmissionExpire;
                $createdDate = $submission->Created;

                if ($questionnaire->ExpireAfterDays && $questionnaire->exists()) {
                    $expiryDays = (string)($questionnaire->ExpireAfterDays);
                } else {
                    $expiryDays = (string)($questionnaire->config()->expiry_days);
                }

                $expiryDate = strtotime(
                    $createdDate . ' + ' . $expiryDays .' days'
                );

                $isExpired = false;

                $isExpired = $expiryDate < time();

                if ($allowedToExpire === 'Yes' && $isExpired) {
                    $submission->QuestionnaireStatus = QuestionnaireSubmission::STATUS_EXPIRED;
                    $submission->write();

                    //Mark all related task submissions as "expired"
                    $submission->TaskSubmissions()
                        ->each(function (TaskSubmission $taskSubmission) {
                            $taskSubmission->Status = TaskSubmission::STATUS_EXPIRED;
                            $taskSubmission->write();
                        });
                }
            }
        });

        //Regenerate the CheckSubmissionExpiredJob and run it at next midnight
        $nextJob = Injector::inst()->create(CheckSubmissionExpiredJob::class);

        singleton(QueuedJobService::class)
            ->queueJob($nextJob, date('Y-m-d H:i:s', strtotime("tomorrow 0:27:30")));

        $this->isComplete = true;
    }
}
