<?php

/**
 * This file contains the "QuestionnaireValidation" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T.
 * @copyright 2019 New Zealand Transport Agency
 * @license https://nzta.govt.nz (BSD-3)
 * @link https://nzta.govt.nz
 */

namespace NZTA\SDLT\Validation;

use Exception;
use NZTA\SDLT\GraphQL\GraphQLAuthFailure;
use SilverStripe\Security\Member;
use SilverStripe\Security\Security;

/**
 * Class QuestionnaireValidation
 */
class QuestionnaireValidation
{
    /**
     * @param array  $inputAnswerfields inputfields
     * @param string $questionsData     questions
     * @param int    $questionID        question id
     * @throws Exception
     * @return void
     */
    public static function validate_answer_input_data($inputAnswerfields, $questionsData, $questionID)
    {
        foreach ($inputAnswerfields as $inputAnswerfield) {
            $inputfieldDetails = QuestionnaireValidation::get_field_details($questionsData, $questionID, $inputAnswerfield->id);

            if (!$inputfieldDetails) {
                throw new Exception(
                    sprintf(
                        'Sorry, no data available for input field ID: %d',
                        $inputfieldDetails->id
                    )
                );
            }

            self::validate_input_field($inputAnswerfield->data, $inputfieldDetails);

            if (!empty($inputAnswerfield->data) && $inputfieldDetails->InputType == 'email') {
                self::validate_email_field($inputAnswerfield->data, $inputfieldDetails);
            }

            if (!empty($inputAnswerfield->data) && $inputfieldDetails->InputType == 'date') {
                self::validate_date_field($inputAnswerfield->data, $inputfieldDetails);
            }

            if (!empty($inputAnswerfield->data) && $inputfieldDetails->InputType == 'url') {
                self::validate_url_field($inputAnswerfield->data, $inputfieldDetails);
            }
        }
    }

    /**
     * @param string     $data              answer data
     * @param DataObject $inputfieldDetails inputfieldsDetails
     * @throws Exception
     * @return void
     */
    public static function validate_input_field($data, $inputfieldDetails)
    {
        // validate required field
        if ($inputfieldDetails->Required && empty($data)) {
            throw new Exception(
                sprintf(
                    '%s is required.',
                    $inputfieldDetails->Label
                )
            );
        }

        // validate minimum length
        if ($inputfieldDetails->MinLength > 0 &&
            strlen($data) < $inputfieldDetails->MinLength) {
            throw new Exception(
                sprintf(
                    'Please enter a value with at least %d characters for %s.',
                    $inputfieldDetails->MinLength,
                    $inputfieldDetails->Label
                )
            );
        }
    }

    /**
     * @param string     $email             email
     * @param DataObject $inputfieldDetails inputfieldsDetails
     * @throws Exception
     * @return void
     */
    public static function validate_email_field($email, $inputfieldDetails)
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception(
                sprintf(
                    'Please enter valid email address for the %s field.',
                    $inputfieldDetails->Label
                )
            );
        }
    }

    /**
     * @param string     $date              date
     * @param DataObject $inputfieldDetails inputfieldsDetails
     * @throws Exception
     * @return void
     */
    public static function validate_date_field($date, $inputfieldDetails)
    {
        $dateExploded = explode("-", $date);

        if (count($dateExploded) != 3) {
            throw new Exception(
                sprintf(
                    'Please enter valid date format for the %s field.',
                    $inputfieldDetails->Label
                )
            );
        }

        //For the sake of clarity, lets assign our array elements to
        //named variables (day, month, year).
        $year = $dateExploded[0];
        $month = $dateExploded[1];
        $day = $dateExploded[2];

        //Finally, use PHP's checkdate function to make sure
        //that it is a valid date and that it actually occured.
        if (!checkdate($month, $day, $year)) {
            throw new Exception($date . ' is not a valid date.');
        }

        if (strlen($year) !== 4) {
            throw new Exception('Please enter a valid year like 2019.');
        }
    }

    /**
     * @param string     $url               url
     * @param DataObject $inputfieldDetails inputfieldsDetails
     * @throws Exception
     * @return void
     */
    public static function validate_url_field($url, $inputfieldDetails)
    {
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            throw new Exception(
                sprintf(
                    'Please enter valid URL for the %s field.',
                    $inputfieldDetails->Label
                )
            );
        }
    }

    /**
    * @param array  $actionFields  actionFields
    * @param string $questionsData questions
    * @param int    $questionID    question id
    * @throws Exception
    * @return void
    */
    public static function validate_answer_action_data($actionFields, $questionsData, $questionID)
    {
        foreach ($actionFields as $actionField) {
            $actionFieldDetails = QuestionnaireValidation::get_field_details($questionsData, $questionID, $actionField->id);

            if (!$actionFieldDetails) {
                throw new Exception(
                    sprintf(
                        'Sorry, no data available for action field ID: %d',
                        $actionField->id
                    )
                );
            }

            if (!is_bool($actionField->isChose)) {
                throw new Exception(
                    sprintf(
                        'Sorry, answer type should be boolean for action field ID: %d',
                        $actionField->id
                    )
                );
            }
        }
    }

    /**
     * @param string $questionsData questions
     * @param int    $questionID    question id
     * @param int    $fieldID       input or action field id
     * @throws Exception
     * @return mixed $currentField current field or null
     */
    public static function get_field_details($questionsData, $questionID, $fieldID)
    {
        $questions = json_decode($questionsData);
        $currentQuestion = null;
        $currentField = null;

        foreach ($questions as $question) {
            if ((int)$question->ID === (int)$questionID) {
                $currentQuestion = $question;
            }
        }

        if (!$currentQuestion) {
            throw new Exception(
                sprintf(
                    'Sorry, no question available for question Id: %d',
                    $questionID
                )
            );
        }

        if ($currentQuestion->AnswerFieldType == 'input') {
            $fields = $currentQuestion->AnswerInputFields;
        } else {
            $fields = $currentQuestion->AnswerActionFields;
        }

        if (!$fields) {
            throw new Exception(
                sprintf(
                    'Sorry, no fields available question Id: %d',
                    $questionID
                )
            );
        }

        foreach ($fields as $field) {
            if ((int)$field->ID === (int)$fieldID) {
                $currentField = $field;
            }
        }

        return $currentField;
    }

    /**
     * @throws GraphQLAuthFailure
     *
     * @return void
     */
    public static function is_user_logged_in()
    {
        $member = Security::getCurrentUser();

        // Check authentication
        if (!$member) {
            throw new GraphQLAuthFailure();
        }
    }
}
