<?php

/**
 * This file contains the "QuestionnaireSubmissionDetailForm_ItemRequest" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright 2018 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\ModelAdmin;

use Exception;
use NZTA\SDLT\Email\SendApprovalLinkEmail;
use NZTA\SDLT\Constant\UserGroupConstant;
use SilverStripe\Forms\GridField\GridFieldDetailForm_ItemRequest;

/**
 * Class QuestionnaireSubmissionDetailForm_ItemRequest
 *
 * This class is used to add resendEmail button on detail view
 */
class QuestionnaireSubmissionDetailForm_ItemRequest extends GridFieldDetailForm_ItemRequest
{
    /**
     * @var array
     */
    private static $allowed_actions = [
        'edit',
        'view',
        'ItemEditForm',
        'resendEmail'
    ];

    /**
     * Builds an item edit form.  The arguments to getCMSFields() are the popupController and
     * popupFormName, however this is an experimental API and may change.
     *
     * @return Form|HTTPResponse
     */
    public function ItemEditForm()
    {
        $form = parent::ItemEditForm();

        if ($form) {
            $formActions = $form->Actions();

            if ($actions = $this->record->getCMSActions()) {
                foreach ($actions as $action) {
                    $formActions->push($action);
                }
            }
        }

        return $form;
    }

    /**
     * custom action to resend approval link email
     * @param DataObject $data submitted data
     * @param Form       $form form
     *
     * @return void
     */
    public function resendEmail($data, $form)
    {
        $questionnaireSubmission = $this->record;

        if ($questionnaireSubmission->SecurityArchitectApprovalStatus !== "pending" &&
            $questionnaireSubmission->CisoApprovalStatus !== "pending" &&
            $questionnaireSubmission->BusinessOwnerApprovalStatus !== "pending") {
              $form->sessionMessage('Sorry, questionnaire submission is not pending for approval.', 'bad');
        }

        if ($questionnaireSubmission->SecurityArchitectApprovalStatus == "pending") {
            $members = $questionnaireSubmission->getApprovalMembersListByGroup(UserGroupConstant::GROUP_CODE_SA);
            new SendApprovalLinkEmail($this->record, $members, '');
            $form->sessionMessage('Email sent to the Security Architect group members.', 'good');
        } else {
            $members = $questionnaireSubmission->getApprovalMembersListByGroup(UserGroupConstant::GROUP_CODE_CISO);

            if ($questionnaireSubmission->CisoApprovalStatus == "pending" &&
                $questionnaireSubmission->BusinessOwnerApprovalStatus == "pending") {
                new SendApprovalLinkEmail($this->record, $members, $this->record->BusinessOwnerEmailAddress);
                $form->sessionMessage('Email sent to the CISO group members and business owner.', 'good');
            } elseif ($questionnaireSubmission->CisoApprovalStatus == "pending") {
                new SendApprovalLinkEmail($this->record, $members, '');
                $form->sessionMessage('Email sent to the CISO group members.', 'good');
            } elseif ($questionnaireSubmission->BusinessOwnerApprovalStatus == "pending") {
                new SendApprovalLinkEmail($this->record, [], $this->record->BusinessOwnerEmailAddress);
                $form->sessionMessage('Email sent to the business owner.', 'good');
            }
        }

        return $this->redirectBack();
    }
}
