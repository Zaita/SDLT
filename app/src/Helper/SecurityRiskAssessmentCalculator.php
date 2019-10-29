<?php
/**
 * This file contains the "SecurityRiskAssessmentCalculator" class.
 *
 * @category SilverStripe_Project
 * @package SDLT
 * @author  Catalyst I.T. SilverStripe Team 2019 <silverstripedev@catalyst.net.nz>
 * @copyright 2019 Catalyst.Net Ltd
 * @license https://www.catalyst.net.nz (Commercial)
 * @link https://www.catalyst.net.nz
 */

namespace NZTA\SDLT\Helper;

use NZTA\SDLT\Model\ControlWeightSet;
use NZTA\SDLT\Model\ImpactThreshold;
use NZTA\SDLT\Model\LikelihoodThreshold;
use NZTA\SDLT\Model\Risk;
use NZTA\SDLT\Model\SecurityControl;
use SilverStripe\Core\Injector\Injectable;
use NZTA\SDLT\Model\RiskRating;

/**
 * This helper class will generate all data required to present the
 * Security Risk Assessment Matrix.
 *
 * Each table has:
 * - Risks
 *      - hasMany Aspects
 *          - hasMany SelectedComponents
 *              - hasMany ImplementedControls
 *              - hasMany RecommendedControls
 * - Weights
 *      - each Control has a Weight associated with this risk. It is keyed in
 *        the following way: [RiskID] => [Impact, Likelihood, ImpactPenalty, LikelihoodPenalty]
 * - Scores
 *      - BaseScore
 *      - Sum of Impact
 *      - Sum of Likelihood
 *      - Sum of ImpactPenalty
 *      - Sum of LikelihoodPenalty
 *      - (more TBC)
 *
 */
class SecurityRiskAssessmentCalculator
{
    use Injectable;

    /**
     * QuestionnaireSubmission
     * for example:- `SecurityRiskAssessmentCalculator::create($qs)`
     * @var [QuestionnaireSubmission] passed in with __constructor
     */
    private $questionnaireSubmission;

    /**
     * When the table data is built, this variable indicates at a high level
     * whether aspects are used for the components
     *
     * @var boolean
     */
    private $sraHasAspects = false;

    /**
     * @param Dataobject $questionnaireSubmission A Questionnaire Submission
     */
    public function __construct($questionnaireSubmission)
    {
        $this->questionnaireSubmission = $questionnaireSubmission;
    }

    /**
     * Getter method for QuestionnaireSubmission
     *
     * @return QuestionnaireSubmission
     */
    public function getQuestionnaireSubmission()
    {
        return $this->questionnaireSubmission;
    }

    /**
     * Setter method for QuestionnaireSubmission
     * @param DataObject $questionnaireSubmission questionnaire submission
     * @return SecurityRiskAssessmentCalculator
     */
    public function setQuestionnaireSubmission($questionnaireSubmission)
    {
        $this->questionnaireSubmission = $questionnaireSubmission;
        return $this;
    }

    /**
     * Get all sibling tasks associated with the questionnaire submission
     *
     * @return void
     */
    public function getSiblingTasks()
    {
        $qs = $this->questionnaireSubmission;

        if ($qs && $qs->exists()) {
            return $qs->TaskSubmissions();
        }

        return null;
    }

    /**
     * Get the associated risk questionnaire task from this submission
     *
     * @return TaskSubmission | null
     */
    public function getRiskQuestionnaireSubmission()
    {
        $siblings = $this->getSiblingTasks();

        if ($siblings) {
            return $siblings->find('Task.TaskType', 'risk questionnaire');
        }

        return null;
    }

    /**
     * Get all associated risk IDs for this SRA questionnaire. This is used
     * to construct a lookup table of the risk's ControlWeights
     *
     * @param array $riskData riskData
     * @return array of IDs, or null if no RQ questionnaire
     */
    public function getRiskDataFromRiskQuestionnaire($riskData)
    {
        if (!$riskData) {
            return null;
        }

        $rIds = [];

        foreach ($riskData as $r) {
            if (isset($r->riskID)) {
                $rIds[$r->riskID] = $r;
            }
        }

        return $rIds;
    }

    /**
    * Get the submitted risk questionnaire task and get the calculated risk Data
    *
    * @return array|null
    */
    public function getRiskQuestionnaireResultData()
    {
        $riskQuestionnaireSubmission = $this->getRiskQuestionnaireSubmission();

        if ($riskQuestionnaireSubmission) {
            return json_decode($riskQuestionnaireSubmission->RiskResultData);
        }

        return null;
    }

    /**
     * Get the control validation audit tasks for this SRA questionnaire
     *
     * @return TaskSubmission | null
     */
    public function getCVATaskSubmission()
    {
        $siblings = $this->getSiblingTasks();

        if ($siblings) {
            return $siblings->find('Task.TaskType', 'control validation audit');
        }

        return null;
    }

    /**
     * Get the control validation audit tasks for this SRA questionnaire
     *
     * @return TaskSubmission | null
     */
    public function getSRATaskSubmission()
    {
        $siblings = $this->getSiblingTasks();

        if ($siblings) {
            return $siblings->find('Task.TaskType', 'security risk assessment');
        }

        return null;
    }

    /**
     * Get the selected components and controls from this SRA questionnaire
     * This is what was actually submitted by the user
     *
     * @return void
     */
    public function getSelectedComponentsAndControls()
    {
        $cvaTaskSubmission = $this->getCVATaskSubmission();

        if ($cvaTaskSubmission) {
            return json_decode($cvaTaskSubmission->CVATaskData);
        }

        return null;
    }

    /**
     * Get the IDs of the selected controls from the CVA tasks
     * This is used to construct a lookup table of weights with an associated
     * risk
     *
     * @return array
     */
    public function getSelectedControlIDsFromCVATask()
    {
        $selectedComponentsAndControls = $this->getSelectedComponentsAndControls();
        if (!$selectedComponentsAndControls) {
            return null;
        }

        $ctrlIds = [];
        foreach ($selectedComponentsAndControls as $component) {
            foreach ($component->controls as $ctrl) {
                if (isset($ctrl->id)) {
                    $ctrlIds[] = $ctrl->id;
                }
            }
        }

        return $ctrlIds;
    }

    /**
     * Seperate the selected components into aspects, then components, then
     * controls.
     *
     * If no aspects are detected on the selected component, only components
     * and controls are returned.
     *
     * @param array $riskWeights         a set of calculated control weights
     * @param array $riskBaseImpactScore risk Base Impact Score
     * @return array
     */
    public function getAspectedComponentsAndControls($riskWeights, $riskBaseImpactScore)
    {
        $selectedComponentsAndControls = $this->getSelectedComponentsAndControls();

        if (!$selectedComponentsAndControls) {
            return null;
        }

        $aspects = [];

        foreach ($selectedComponentsAndControls as $component) {
            $aspectName = $component->productAspect ?: null;

            //@todo: When the CVA task is complete, this hard-coded answer will become a constant
            $implementedControls = array_filter($component->controls, function ($ctrl) {
                return $ctrl->selectedOption == SecurityControl::CTL_STATUS_1;
            });

            //@todo: When the CVA task is complete, this hard-coded answer will become a constant
            $recommendedControls = array_filter($component->controls, function ($ctrl) {
                return $ctrl->selectedOption == SecurityControl::CTL_STATUS_2;
            });

            $output = [
                'Name' => $aspectName,
                'ImplementedControls' => $implementedControls,
                'RecommendedControls' => $recommendedControls,
                'Sum' => [
                    //impact and likelihood weights need to account for all controls
                    'I' => $this->summariseSelectedControls($component->controls, $riskWeights, 'I'),
                    'L' => $this->summariseSelectedControls($component->controls, $riskWeights, 'L'),

                    //only the recommended controls have penalties to summarise
                    'IP' => $this->summariseSelectedControls($recommendedControls, $riskWeights, 'IP'),
                    'LP' => $this->summariseSelectedControls($recommendedControls, $riskWeights, 'LP'),
                ],
            ];

            $likelihoodSum = $output['Sum']['L'];
            $impactSum = $output['Sum']['I'];
            foreach ($component->controls as $idx => $ctrl) {
                $controlWeight = $riskWeights[$ctrl->id] ?? 0;

                if ($controlWeight) {
                    $ctrl->Weights = [
                        'I' => $this->normaliseImpactWeight($controlWeight['I'], $impactSum, $riskBaseImpactScore),
                        'L' => $this->normaliseLikelihoodWeight($controlWeight['L'], $likelihoodSum),
                        'IP' => $controlWeight['IP'],
                        'LP' => $controlWeight['LP']
                    ];
                }
            }
            $output['Components'] = $component;
            $output['currentLikelihoodScore'] = $this->calculateCurrentLikelihoodScore(
                $output['Sum']['L'],
                $output['Sum']['LP']
            );

            $output['currentImpactScore'] = $this->calculateCurrentImpactScore(
                $output['Sum']['L'],
                $output['Sum']['LP'],
                $riskBaseImpactScore
            );

            // get SRA task Id
            $sraTaskID = $this->getSRATaskSubmission()->Task()->ID;

            // calculate current Impact
            $currentImpactThreshold = $this->lookupImpactThresholdFromScore($output['currentImpactScore']);
            $output['currentImpactName'] = $currentImpactThreshold ? $currentImpactThreshold->Name : '';
            $output['currentImpactColour'] = $currentImpactThreshold ? $currentImpactThreshold->getHexColour() : null;

            // calculate current Likelihood
            $currentLikelihoodThreshold = $this->lookupLikelihoodThresholdFromScore(
                $output['currentLikelihoodScore'],
                $sraTaskID
            );
            $output['currentLikelihoodName'] = $currentLikelihoodThreshold ? $currentLikelihoodThreshold->Name : '';
            $output['currentLikelihoodColour'] = $currentLikelihoodThreshold ?
                $currentLikelihoodThreshold->getHexColour() : null;

            // calculate current RiskRating based on current Impact and current Likelihood
            $riskRating = $this->lookupCurrentRiskRatingThreshold(
                $output['currentLikelihoodName'],
                $output['currentImpactName'],
                $sraTaskID
            );
            $output['riskRatingName'] = $riskRating ? $riskRating->RiskRating : '';
            $output['riskRatingColour'] = $riskRating ? '#' . $riskRating->Colour : null;

            //if any aspect is detected, the final calculated data will factor it in
            //otherwise, no aspects will be displayed in the table
            if ($aspectName) {
                $this->sraHasAspects = true;
                $aspects[$aspectName][] = $output;
            } else {
                $aspects[] = $output;
            }
        }

        return $aspects;
    }

    /**
     * Calculate the current likelihood score for this aspect (or risk, if no
     * aspects) We start with 100, then deduct the implemented weights. THEN we
     * add the penalties. The result will be the greater of 1 and that number.
     *
     * With the penalties applied it is possible for the likelihood to exceed
     * 100, which is still acceptable
     *
     * @param int $sumOfLikelihoodWeights   sum of likelihood weight
     * @param int $sumOfLikelihoodPenalties sum of likelihood penalties
     * @return int
     */
    public function calculateCurrentLikelihoodScore($sumOfLikelihoodWeights, $sumOfLikelihoodPenalties)
    {
        // =MAX(1, (100-sumOfLikelihoodWeights)+sumOfLikelihoodPenalties)
        $likelihoodScore = (100 - $sumOfLikelihoodWeights) + $sumOfLikelihoodPenalties;
        return max(1, $likelihoodScore);
    }

    /**
     * Calculate the current impact score for this aspect (or risk, if no
     * aspects) We start with the base impact score, then deduct the implemented
     * weights. THEN we add the penalties. The result will be the greater of 1
     * and that number.
     *
     * @param int $sumOfImpactWeights   sum of impact weight
     * @param int $sumOfImpactPenalties sum of impact penalties
     * @param int $baseImpactScore      base Impact Score
     * @return int
     */
    public function calculateCurrentImpactScore($sumOfImpactWeights, $sumOfImpactPenalties, $baseImpactScore)
    {
        $impactScore = ($baseImpactScore - $sumOfImpactWeights) + $sumOfImpactPenalties;
        return max(1, $impactScore);
    }

    /**
     * @param int $score current Impact Score
     * @return DataObject ImpactThreshold
     */
    public function lookupImpactThresholdFromScore($score)
    {
        return ImpactThreshold::match($score);
    }

    /**
     * @param int $score  current Likelihood Score
     * @param int $taskID SRA task Id
     * @return DataObject LikelihoodThreshold
     */
    public function lookupLikelihoodThresholdFromScore($score, $taskID)
    {
        return LikelihoodThreshold::match($score, $taskID);
    }

    /**
     * get details for Current Risk Rating
     * example: $currentRiskRating = $this->lookupCurrentRiskRatingThreshold('Rare', 'Insignificant');
     *
     * @param string $currentLikelihood current calcutlated likelihood
     * @param string $currentImpact     current calcutlated Impact
     * @param int    $taskID            SRA task Id
     *
     * @return DataObject|null
     */
    public function lookupCurrentRiskRatingThreshold($currentLikelihood, $currentImpact, $taskID)
    {
        return RiskRating::match(
            $currentLikelihood,
            $currentImpact,
            $taskID
        );
    }

    /**
     * Normalise the CMS Likelihood Weight for this control against all of the
     * component's implemented and recommended controls. The sum of these
     * normalised weights should add up to 100.
     *
     *
     * @param int $likelihoodControlWeight unaltered control weight obtained
     *                                     from the CMS for this particular risk
     * @param int $likelihoodSum           this is the sum of all likelihoods for this
     *                                     component's recommended and implemented controls
     * @return int
     */
    public function normaliseLikelihoodWeight($likelihoodControlWeight, $likelihoodSum)
    {
        if ($likelihoodSum > 0) {
            $normalisedWeight = $likelihoodControlWeight / $likelihoodSum;
            return number_format(100 * $normalisedWeight, 2);
        }
        return 0;
    }

    /**
     * Normalise the CMS Impact Weight for this control against all of the
     * component's implemented and recommended controls. The sum of these
     * normalised weights should add up to the base impact score.
     *
     *
     * @param int $impactControlWeight unaltered control weight obtained
     *                                 from the CMS for this particular risk
     * @param int $impactSum           this is the sum of all impacts for this component's
     *                                 recommended and implemented controls
     * @param int $baseImpactScore     the base impact score calculated for this
     *                                 risk, obtained from the risk questionnaire results
     * @return int
     */
    public function normaliseImpactWeight($impactControlWeight, $impactSum, $baseImpactScore)
    {
        if ($impactSum > 0) {
            $normalisedWeight = $impactControlWeight / $impactSum;
            return number_format($baseImpactScore * $normalisedWeight, 2);
        }
        return 0;
    }

    /**
     * Summarise selected controls within a given aspect. Given a pre-filtered set of selected controls, summarise based
     * on a given key, which is one of:
     *
     * I: Impact, for Implemented controls
     * L: Likelihood, for Implemented controls
     * IP: Impact Penalty, for Recommended controls
     * LP: Likelihood Penalty, for Recommended controls
     *
     * @param array  $filteredSet    this is a prefiltered array, with only $chosenAnswer elected
     * @param array  $controlWeights this is the full set of riskWeights, keyed by controlID. If the control ID exists
     *                               in the weight set, we summarise the $key value
     * @param string $key            one of 'Realised' or 'Intended' (or 'N/A', which is omitted).
     * @return int
     */
    public function summariseSelectedControls($filteredSet, $controlWeights, $key = 'I'): int
    {
        $sum = 0;

        foreach ($filteredSet as $set) {
            $selectedControlID = $set->id;
            $weights = $controlWeights[$selectedControlID] ?? [];
            if (isset($weights[$key])) {
                $sum += (int) $weights[$key];
            }
        }

        return $sum;
    }

    /**
     * This is the only publicly consumed function of the SRA table.
     * This obtains every identified risk from the questionnaire and every
     * control weight associated with those risks.  A base impact score for each
     * risk has been previously calculated by the risk questionnaire and is
     * included here, as well as an appropriate rating and colour.
     *
     * Selected components and their controls are then identified, with
     * summations and penalties calculated. Components _may_ be aspected, but
     * the results table will account for them whether present or not.
     * @return array always returns an array. It's empty if there's no risks
     */
    public function getTableData()
    {
        //we need to obtain every risk identified in the risk questionnaire
        $riskData = $this->getRiskQuestionnaireResultData();

        //index the selected risk data by riskID
        $riskData = $this->getRiskDataFromRiskQuestionnaire($riskData);

        //bail out if the risk data is empty
        if (!$riskData) {
            return [];
        }

        //default output table
        $out = [
            'Risks' => null
        ];

        //to get the weights, we need to get every ControlWeight associated with
        //our identified risks
        $riskIds = array_keys($riskData);
        $risks = Risk::get()->byIDs($riskIds);

        //get all controls selected by the user
        $controlIds = $this->getSelectedControlIDsFromCVATask();
        if (!$controlIds) {
            return;
        }
        foreach ($risks as $risk) {
            // //foreach risk, query its set of control weights. This is a big performance hit
            $weights = $risk->ControlWeightSets();

            // //we need to flatten the array to only the data we need
            // //start with an empty array, and add data
            $outWeights = [];
            foreach ($weights as $w) {
                //exclude security controls that are not selected
                if (!in_array($w->SecurityControlID, $controlIds)) {
                    continue;
                }

                //index with selected control
                //add Impact, Likelihood, ImpactPenalty, LikelihoodPenalty
                $outWeights[$w->SecurityControlID] = [
                    'I' => $w->Impact,
                    'L' => $w->Likelihood,
                    'IP' => $w->ImpactPenalty,
                    'LP' => $w->LikelihoodPenalty,
                    'CID' => $w->SecurityComponentID
                ];
            }

            $calculatedRiskData = $riskData[$risk->ID];
            if (!$calculatedRiskData) {
                continue;
            }

            $baseImpactScore = (int) round($calculatedRiskData->score);
            //build out final sub-array with risk and selected control weights
            $out['Risks'][] = [
                'RiskID' => $risk->ID,
                'Name' => $calculatedRiskData->riskName,
                'BaseImpactScore' => (int) round($calculatedRiskData->score),
                'Rating' => $calculatedRiskData->rating,
                'Colour' => '#' . $calculatedRiskData->colour,
                'Weights' => $outWeights,
                'Aspects' => $this->getAspectedComponentsAndControls($outWeights, $baseImpactScore),
                'HasAspects' => (bool) $this->sraHasAspects,
            ];
        }

        $sraTask = $this->getSRATaskSubmission();
        $out['LikelihoodThresholds'] = $sraTask->task()->getLikelihoodRatingsData();
        $out['RiskRatingThresholds'] = $sraTask->task()->getRiskRatingsData();

        return $out;
    }

    /**
     * @return array
     */
    public function getLikelihoodRatings()
    {
        $sraTask = $this->getSRATaskSubmission();
        $likelihoodThresholds = $sraTask->task()->getLikelihoodRatingsData();
    }
}
