<?php

/**
 * This file contains the "QuestionnaireEmail" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2018 <silverstripedev@catalyst.net.nz>
 * @copyright NZ Transport Agency
 * @license BSD-3
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Model;

use SilverStripe\ORM\DataObject;
use SilverStripe\Forms\TextField;
use SilverStripe\Forms\HTMLEditor\HtmlEditorField;
use SilverStripe\Forms\LiteralField;
use SilverStripe\Forms\ToggleCompositeField;
use SilverStripe\Forms\FormField;
use SilverStripe\Forms\FieldList;
use NZTA\SDLT\Traits\SDLTModelPermissions;
use NZTA\SDLT\Constant\UserGroupConstant;

/**
 * Class QuestionnaireEmail
 */
class QuestionnaireEmail extends DataObject
{
    use SDLTModelPermissions;
    /**
     * @var string
     */
    private static $table_name = 'QuestionnaireEmail';

    /**
     * @var array
     */
    private static $db = [
        'FromEmailAddress' => 'Varchar(255)',
        'StartLinkEmailSubject' => 'Text',
        'StartLinkEmailBody' => 'HTMLText',
        'SummaryLinkEmailSubject' => 'Text',
        'SummaryLinkEmailBody' => 'HTMLText',
        'SecurityArchitectApprovalLinkEmailSubject' => 'Text',
        'SecurityArchitectApprovalLinkEmailBody' => 'HTMLText',
        'BusinessOwnerApprovalLinkEmailSubject' => 'Text',
        'BusinessOwnerApprovalLinkEmailBody' => 'HTMLText',
        'CISOApprovalLinkEmailSubject' => 'Text',
        'CISOApprovalLinkEmailBody' => 'HTMLText',
        'ApprovedNotificationEmailSubject' => 'Text',
        'ApprovedNotificationEmailBody' => 'HTMLText',
        'DeniedNotificationEmailSubject' => 'Text',
        'DeniedNotificationEmailBody' => 'HTMLText',
        'EmailSignature' => 'HTMLText',
    ];

    /**
     * @var array
     */
    private static $summary_fields = [
        'FromEmailAddress'
    ];

    /**
     * Of the total no. roles in the system, these are those that are applicable
     * to sending emails.
     *
     * @var array
     */
    private static $approval_roles = [
        'CISO',
        'SecurityArchitect',
        'BusinessOwner',
    ];

    /**
     * CMS Fields
     * @return FieldList
     */
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        $fields->addFieldsToTab(
            'Root.StartLinkEmail',
            [
                TextField::create(
                    'StartLinkEmailSubject',
                    'Start Link Email Subject'
                ),
                HtmlEditorField::create(
                    'StartLinkEmailBody',
                    'Start Link Email Body'
                ),
                LiteralField::create(
                    'StartEmailHelpText',
                    'Please use variable {$questionnaireName} for questionnaire name and
                        {$startLink} for start link in the email body and Subject.
                        {$startLink} will be replaced by "this link" label.'
                )
            ]
        );

        $fields->addFieldsToTab(
            'Root.SummaryLinkEmail',
            [
                TextField::create(
                    'SummaryLinkEmailSubject',
                    'Summary Link Email Subject'
                ),
                HtmlEditorField::create(
                    'SummaryLinkEmailBody',
                    'Summary Link Email Body'
                ),
                LiteralField::create(
                    'SummaryLinkEmailHelpText',
                    'Please use variable {$questionnaireName} for questionnaire name, {$productName} for product name  and
                        {$summaryLink} for summary link in the email body and subject.
                        {$summaryLink} will be replaced by "this link" label.'
                )
            ]
        );

        $fields->addFieldsToTab(
            'Root.ApprovalLinkEmails',
            $this->approvalLinkEmailFields($fields)
        );

        $fields->addFieldsToTab(
            'Root.ApprovedNotificationEmail',
            [
                TextField::create(
                    'ApprovedNotificationEmailSubject',
                    'Approved Notification Email Subject'
                ),
                HtmlEditorField::create(
                    'ApprovedNotificationEmailBody',
                    'Approved Notification Email Body'
                ),
                LiteralField::create(
                    'ApprovedNotificationEmailhelpText',
                    'Please use variable {$questionnaireName} for questionnaire name and {$productName} for product name in the email body and subject.'
                )
            ]
        );

        $fields->addFieldsToTab(
            'Root.DeniedNotificationEmail',
            [
                TextField::create(
                    'DeniedNotificationEmailSubject',
                    'Denied Notification Email Subject'
                ),
                HtmlEditorField::create(
                    'DeniedNotificationEmailBody',
                    'Denied Notification Email Body'
                ),
                LiteralField::create(
                    'DeniedNotificationEmailhelpText',
                    'Please use variable {$questionnaireName} for questionnaire name and {$productName} for product name in the email body and subject.'
                )
            ]
        );

        $questions = $fields->dataFieldByName('Questions');

        if ($questions) {
            $config = $questions->getConfig();

            $config->addComponent(
                new GridFieldOrderableRows('SortOrder')
            );

            $pageConfig = $config->getComponentByType(GridFieldPaginator::class);
            $pageConfig->setItemsPerPage(250);
        }

        return $fields;
    }

    /**
     * Simply returns an array of fields used for the "Approval Link Emails" CMS
     * getCMSFields() tab.
     *
     * @param  FieldList $fields Incoming fields for getCMSFields().
     * @return array
     */
    private function approvalLinkEmailFields(FieldList $fields) : array
    {
        $approvalLinkEmailFields = [];
        $reflected = new \ReflectionClass(UserGroupConstant::class);
        $roles = array_filter($reflected->getConstants(), function ($v, $k) {
            return preg_match("#^ROLE_CODE#", $k);
        }, ARRAY_FILTER_USE_BOTH);

        foreach ($roles as $recipient) {
            $fieldNameBase = "{$recipient}ApprovalLinkEmail";

            if (!in_array($recipient, $this->config()->get('approval_roles'))) {
                continue;
            }

            // Remove scaffolded fields
            foreach (['Subject', 'Body'] as $scaffolded) {
                $fields->removeByName("{$fieldNameBase}$scaffolded");
            }

            $approvalLinkEmailFields[] = ToggleCompositeField::create(
                "{$recipient}Approval",
                FormField::name_to_label("{$recipient} Approval Email"),
                [
                    TextField::create(
                        "{$fieldNameBase}Subject",
                        'Subject'
                    ),
                    HtmlEditorField::create(
                        "{$fieldNameBase}Body",
                        'Body'
                    )
                        ->setRows(10)
                        ->setDescription(
                            '<p class="message notice">You can use the following variable substitutions:<br/><br/>' .
                            '<b>{$questionnaireName}</b> For questionnaire name<br/>' .
                            '<b>{$productName}</b> For product name<br/>' .
                            '<b>{$approvalLink}</b> For approval link<br/>' .
                            '<b>{$submitterName}</b> For submitter name<br/>' .
                            '<b>{$submitterEmail}</b> For submitter email in the email body and subject<br/>' .
                            '<b>{$approvalLink}</b> Will be replaced by "this link" label.</p>'
                        )
                ]
            );
        }

        return $approvalLinkEmailFields;
    }

}
