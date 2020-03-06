<?php

/**
 * This file contains the "SDLTSubmissionJson" trait.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright NZ Transport Agency
 * @license BSD-3
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Traits;

use InvalidArgumentException;

trait SDLTSubmissionJson
{
    /**
     * get the answer data for the given field type
     *
     * @param string $submissionType submission type (task or questionnaire)
     * @param string $fieldType      field type
     *
     * @return string
     */
    public function getAnswerDataForFieldByType(string $submissionType, string $fieldType) : string
    {
        $data = '';

        if (empty($submissionType) || empty($fieldType)) {
            throw new InvalidArgumentException('Submission Type and Field Type are required.');
        }

        // qs= QuestionnaireSubmission, ts= TaskSubmission
        if ($submissionType !== 'qs' && $submissionType !== 'ts') {
            throw new InvalidArgumentException(sprintf('"%s" is not a valid type.', $submissionType));
        }

        $questionnaireData = json_decode($this->QuestionnaireData, true);
        $answerData = json_decode($this->AnswerData, true);

        // if questionnaire data or answer Data is empty, then return empty array
        if (empty($questionnaireData) || empty($answerData)) {
            return $data;
        }

        $inputFieldDetails = [];

        // traverse the $questions until we don't find our first field for the given type
        foreach ($questionnaireData as $question) {
            if (empty($inputFieldDetails)) {
                $inputFieldDetails = $this->getQuestionInputFieldByType(
                  $question,
                  $fieldType
                );
            }
        }

        // if there is no input field for the given type, then return empty array
        if (empty($inputFieldDetails)) {
            return $data;
        }

        $data = $this->getAnswerForInputFieldFromAnswerData($inputFieldDetails, $answerData);

        return $data;
    }

    /**
     * get the input field by type from the question input fields
     * return the first match
     *
     * @param array  $question  question to get input fields
     * @param string $fieldType field type
     *
     * @return array
     */
    public function getQuestionInputFieldByType(array $question, string $fieldType) : array
    {
        $inputFieldDetails = [];

        // if argument is invalid
        if (empty($question) || empty($fieldType)) {
            throw new InvalidArgumentException('Question and Field Type are required.');
        }

        // if question AnswerFieldType is not input
        if (!isset($question['AnswerFieldType']) &&
            $question['AnswerFieldType'] !== "input") {
            return $inputFieldDetails;
        }

        if (isset($question['AnswerInputFields'])) {
            foreach ($question['AnswerInputFields'] as $inputField) {
                // return first matching for field type
                if ($inputField['InputType'] === $fieldType) {
                    $inputFieldDetails['QuestionID'] = $question['ID'];
                    return $inputFieldDetails = array_merge($inputFieldDetails, $inputField);
                }
            }
        }

        return $inputFieldDetails;
    }

    /**
     * get the answer data for the input field
     *
     * @param array $inputField input field
     * @param array $answerData answer data
     *
     * @return string
     */
    public function getAnswerForInputFieldFromAnswerData(array $inputField, array $answerData) : string
    {
        $data = '';
        $questionID = $inputField['QuestionID'];

        if (!isset($answerData[$questionID])) {
            return $data;
        }

        $selectedQuestionAnswer = $answerData[$questionID];

        if (!isset($selectedQuestionAnswer['answerType']) &&
            $selectedQuestionAnswer['answerType'] !== 'input') {
            return $data;
        }

        if (isset($selectedQuestionAnswer['inputs'])) {
            foreach ($selectedQuestionAnswer['inputs'] as $answerForInputField) {
                // return first matching for field type
                if ((int) $answerForInputField['id'] === (int)$inputField['ID']) {
                    if (isset($answerForInputField['data'])) {
                        return $answerForInputField['data'];
                    }
                }
            }
        }

        return $data;
    }

    /**
     * get ProductAspectList
     *
     * @param string $productAspectData product aspects field answer
     *
     * @return array
     */
    public function getProductAspectList(string $productAspectData) : array
    {
        $productAspects = [];

        if (empty($productAspectData)) {
            return $productAspects;
        }

        $productAspects = explode("\n", $productAspectData);

        return $productAspects;
    }
}
