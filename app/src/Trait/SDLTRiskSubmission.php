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
        if ($type === 'q') {
            $obj = $this->Questionnaire();
        } else if ($type === 't') {
            $obj = $this->Task();
        } else {
            throw new \InvalidArgumentException(sprintf('"%s" is not a valid type.', $type));
        }

        if (!$obj || !$obj->isRiskType()) {
            return [];
        }

        $formula = $obj->riskFactory();
        $questionnaireData = json_decode($this->QuestionnaireData, true);
        $riskData = [];
        $answerCandidates = [];

        foreach ($questionnaireData as $question) {
            foreach ($question['AnswerInputFields'] as $answer) {
                if (!$answer['MultiChoiceAnswer'] || !$selections = json_decode($answer['MultiChoiceAnswer'], true)) {
                    continue;
                }

                $answerCandidates[$answer['ID']] = $selections;
            }
        }

        if ($answerCandidates) {
            $answerRecords = AnswerInputField::get()->filter(['ID' => array_keys($answerCandidates)]);

            foreach ($answerRecords as $answerRecord) {
                $selections = $answerCandidates[$answerRecord->ID];
                $selectionRecords = $answerRecord->AnswerSelections()->filter(['Value' => array_column($selections, 'calc_value')]);

                foreach ($selectionRecords as $selectionRecord) {
                    if (!$selectionRecord->Risks()->count()) {
                        continue;
                    }

                    foreach ($selectionRecord->Risks() as $risk) {
                        $riskData[$risk->ID]['riskName'] = $risk->Name;
                        $riskData[$risk->ID]['weights'][] = $risk->Weight;
                    }
                }
            }
        }

        foreach ($riskData as $riskId => $data) {
            $riskData[$riskId]['score'] = $formula->setWeightings($data['weights'])->calculate();
            $riskData[$riskId]['rating'] = 'TBC';
        }

        // Remove empty arrays
        return array_values($riskData);
    }
}
