<?php

namespace NZTA\SDLT\Helper;

use NZTA\SDLT\Model\ControlWeightSet;
use NZTA\SDLT\Model\Risk;
use NZTA\SDLT\Model\SecurityControl;
use SilverStripe\Core\Injector\Injectable;

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
     *
     * @var [QuestionnaireSubmission] passed in with __constructor
     * @example `SecurityRiskAssessmentCalculator::create($qs)`
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
     * @return array of IDs, or null if no RQ questionnaire
     */
    public function getRiskDataFromRiskQuestionnaire($riskData)
    {
        if (!$riskData) return null;

        $rIds = [];

        foreach ($riskData as $r) {
            if (isset($r->riskID)) {
                $rIds[$r->riskID] = $r;
            }
        }

        return $rIds;
    }

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
    public function getSRATask()
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
        if (!$selectedComponentsAndControls) return null;

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
     * @param array riskWeights: a set of calculated control weights
     * @return array
     */
    public function getAspectedComponentsAndControls($riskWeights)
    {
        $selectedComponentsAndControls = $this->getSelectedComponentsAndControls();
        if (!$selectedComponentsAndControls) return null;
        $aspects = [];

        foreach ($selectedComponentsAndControls as $component) {
            $aspectName = $component->productAspect ?: null;

            //@todo: When the CVA task is complete, this hard-coded answer will become a constant
            $implementedControls = array_filter($component->controls, function($ctrl) {
                return $ctrl->selectedOption == SecurityControl::CTL_STATUS_1;
            });

            //@todo: When the CVA task is complete, this hard-coded answer will become a constant
            $recommendedControls = array_filter($component->controls, function($ctrl) {
                return $ctrl->selectedOption == SecurityControl::CTL_STATUS_2;
            });

            $output = [
                'Name' => $aspectName,
                'Components' => $component,
                'Sum' => [
                    'I' => $this->summariseSelectedControls($implementedControls, $riskWeights, 'I'),
                    'L' => $this->summariseSelectedControls($implementedControls, $riskWeights, 'L'),
                    'IP' => $this->summariseSelectedControls($recommendedControls, $riskWeights, 'IP'),
                    'LP' => $this->summariseSelectedControls($recommendedControls, $riskWeights, 'LP'),
                ],
            ];

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
     * Summarise selected controls within a given aspect. Given a pre-filtered set of selected controls, summarise based
     * on a given key, which is one of:
     *
     * I: Impact, for Implemented controls
     * L: Likelihood, for Implemented controls
     * IP: Impact Penalty, for Recommended controls
     * LP: Likelihood Penalty, for Recommended controls
     *
     * @param [array] $filteredSet this is a prefiltered array, with only $chosenAnswer elected
     * @param [array] $controlWeights, this is the full set of riskWeights, keyed by controlID. If the control ID exists
     * in the weight set, we summarise the $key value
     * @param string $key one of 'Realised' or 'Intended' (or 'N/A', which is omitted).
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
        if (!$riskData) return [];

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
        if (!$controlIds) return;
        foreach ($risks as $risk) {
            // //foreach risk, query its set of control weights. This is a big performance hit
            $weights = $risk->ControlWeightSets();

            // //we need to flatten the array to only the data we need
            // //start with an empty array, and add data
            $outWeights = [];
            foreach ($weights as $w) {
                //exclude security controls that are not selected
                if (!in_array($w->SecurityControlID, $controlIds)) continue;

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
            if (!$calculatedRiskData) continue;

            //build out final sub-array with risk and selected control weights
            $out['Risks'][] = [
                'RiskID' => $risk->ID,
                'Name' => $calculatedRiskData->riskName,
                'BaseImpactScore' => (int) round($calculatedRiskData->score),
                'Rating' => $calculatedRiskData->rating,
                'Colour' => '#' . $calculatedRiskData->colour,
                'Weights' => $outWeights,
                'Aspects' => $this->getAspectedComponentsAndControls($outWeights),
                'HasAspects' => (bool) $this->sraHasAspects,
            ];
        }

        $sraTask = $this->getSRATask();
        $likelihoodThresholds = json_decode($sraTask->LikelihoodRatings) ?? [];
        $out['LikelihoodThresholds'] = $likelihoodThresholds;

        return $out;
    }

}
