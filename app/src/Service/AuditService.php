<?php

/**
 * This file contains the "AuditService" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright 2019 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Service;

use SilverStripe\Core\Injector\Injectable;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\ValidationException;
use NZTA\SDLT\Model\AuditEvent;
use NZTA\SDLT\Helper\ClassSpec;

/**
 * This service is injected into any required data-models such as {@link Questionnaire}
 * {@link Task} and {@link TaskSubmission} objects.
 *
 * See {@link AuditEvent} and {@link AuditAdmin}.
 *
 * Usage:
 *
 * ```yml
 * SilverStripe\Core\Injector\Injector:
 *   auditService: '%$NZTA\SDLT\Audit\AuditService'
 * ```
 *
 * ```php
 * $this->auditService->commit('Create', 'Model was created', $model, Security::getCurrentUser()->Email);
 * ```
 */
class AuditService
{
    use Injectable;

    /**
     * @var string
     */
    const CREATE = 'Create';

    /**
     * @var string
     */
    const SUBMIT = 'Submit';

    /**
     * @var string
     */
    const CHANGE = 'Change';

    /**
     * @var string
     */
    const COMPLETE = 'Complete';

    /**
     * @var string
     */
    const APPROVE = 'Approve';

    /**
     * @var string
     */
    const DENY = 'Deny';

    /**
     * Commit a single audit event.
     *
     * @param  string     $event     An a single event, declared as a service constant.
     * @param  string     $extra     Additional data to save alongside the event-name itself.
     * @param  DataObject $model     The model that invoked this commit.
     * @param  string     $userData  Arbitrary data about the user that fired the event.
     * @return void
     */
    public function commit(string $event, string $extra, DataObject $model, $userData = '') : void
    {
        $this->validateEvent($event);
        $event = self::normalise_event($event, $model);

        AuditEvent::create()
                ->log($event, $extra, $model, $userData)
                ->write();
    }

    /**
     * Is the passed $event legitimate?
     *
     * @param  string $event The event name to check.
     * @return void
     * @throws ValidationException
     */
    public function validateEvent(string $event) : void
    {
        $legit = (new \ReflectionClass(__CLASS__))->getConstants();

        if (!in_array($event, $legit)) {
            throw new ValidationException(sprintf('Audit event "%s" does not exist.', $event));
        }
    }

    /**
     * Normalise an event, to produce something like: "QUESTIONNAIRE.CREATE" (etc)
     *
     * @param  string     $event The passed event.
     * @param  DataObject $model The passed DataObject subclass.
     * @return string
     */
    public static function normalise_event(string $event, DataObject $model) : string
    {
        return strtoupper(sprintf(
            '%s.%s',
            ClassSpec::short_name(get_class($model)),
            $event
        ));
    }
}
