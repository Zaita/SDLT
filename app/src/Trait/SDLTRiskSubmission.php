<?php

/**
 * This file contains the "SDLTRiskSubmission" trait.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright 2019 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Traits;

use NZTA\SDLT\Model\ImpactThreshold;
use NZTA\SDLT\Model\AnswerInputField;

trait SDLTRiskSubmission
{
    /**
     * Compile risk data from each of the related {@link Questionnaire}'s or {@link Task}'s
     * answers, and return them as a simple array.
     *
     * Initial use-case is the display of risk data on a summary screen in the
     * frontend. To this end: This data can be found from the "GQRiskResult"
     * GraphQL endpoint on {@link QuestionnaireSubmission}.
     *
     * @see    {@link AnswerExtension}, {@link MultiChoiceAnswerSelection}, {@link TaskSubmission}.
     * @param  string $type One of "t" (Task) or "q" (Questionnaire).
     * @return array Generates an array that can be used to render for example, a
     *               visible table of risk + weight + score and rating columns for
     *               questions/answers directly of this Questionnaire and any related
     *               tasks. For tasks, we'll take the value from {@link TaskSubmission::getRiskResult()}.
     * @throws InvalidArgumentException
     *
     * Simple GraphQL query:
     *
     * <code>
     * query {readQuestionnaireSubmission(UUID: "xxx-xxx-xxx-xxx") {
     *     UUID
     *     GQRiskResult
     * }}
     * </code>
     */
    public function getRiskResult(string $type) : array
    {
        $riskData = [];

        // q= QuestionnaireSubmission, t= TaskSubmission
        if ($type === 'q') {
            $obj = $this->Questionnaire();
        } elseif ($type === 't') {
            $obj = $this->Task();
        } else {
            throw new \InvalidArgumentException(sprintf('"%s" is not a valid type.', $type));
        }

        if (!$obj || !$obj->isRiskType()) {
            return $riskData;
        }

        $formula = $obj->riskFactory();

        // get questions and answers from submission json
        $questionnaireData = json_decode($this->QuestionnaireData, true);
        $answerData = json_decode($this->AnswerData, true);

        if (empty($questionnaireData) || empty($answerData)) {
            return $riskData;
        }

        $selectedRiskData = [];

        // traverse questions
        foreach ($questionnaireData as $question) {
            $questionID = $question['ID'];
            $answers = [];

            // get answers for all the input fields of the questions
            if (!$answers = $answerData[$questionID]) {
                continue;
            }

            // if question type is input
            $questionRisks = [];
            if ($question['AnswerFieldType'] === 'input' && !empty($question['AnswerInputFields'])) {
                $questionRisks = AnswerInputField::get_risk_for_input_fields(
                    $question['AnswerInputFields'],
                    $answers
                );
            }

            $selectedRiskData = array_merge($selectedRiskData, $questionRisks);
        }

        // create array for unique $risk['ID']
        foreach ($selectedRiskData as $risk) {
            $riskData[$risk['ID']]['riskName'] = $risk['Name'];
            $riskData[$risk['ID']]['weights'][] = $risk['Weight'];
        }

        $default = new class {
            public $Name = 'Unknown';
            public $Colour = 'ffffff';
        };

        foreach ($riskData as $riskId => $data) {
            $score = $formula->setWeightings($data['weights'])->calculate();
            $impact = ImpactThreshold::match($score);
            $riskData[$riskId]['score'] = $score;
            $riskData[$riskId]['rating'] = $impact ? $impact->Name : $default->Name;;
            $riskData[$riskId]['weights'] = implode(', ', $data['weights']);
            $riskData[$riskId]['colour'] = $impact ? $impact->Colour : $default->Colour;
            $riskData[$riskId]['riskID'] = $riskId;
        }

        return array_values($riskData);
    }
}
