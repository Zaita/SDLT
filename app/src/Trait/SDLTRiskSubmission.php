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

        $riskData = [];

        foreach ($obj->Questions() as $question) {
            foreach ($question->AnswerInputFields() as $answer) {
                foreach ($answer->getRisks() as $risk) {
                    $riskData[$risk->ID]['riskName'] = $risk->Name;
                    $riskData[$risk->ID]['weights'][] = $risk->Weight;
                }
            }
        }

        $formula = $obj->riskFactory();

        foreach ($riskData as $riskId => $data) {
            $riskData[$riskId]['score'] = $formula->setWeightings($data['weights'])->calculate();
            $riskData[$riskId]['rating'] = 'TBC';
        }

        return array_values($riskData);
    }
}
