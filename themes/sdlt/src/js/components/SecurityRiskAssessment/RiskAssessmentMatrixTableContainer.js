// @flow
import React, {Component} from "react";
import type {LikelihoodThreshold} from "../../types/Task";
import {
  DEFAULT_SRA_MATRIX_THRESHOLD_SCORE,
  CTL_STATUS_1,
  CTL_STATUS_2
} from "../../constants/values";
import Comparators from "../../utils/Comparators";
import TaskParser from "../../utils/TaskParser";

type Props = {
  tableData: object
};

class RiskAssessmentMatrixTableContainer extends Component<Props> {

  /**
   * Given an array of likelihoods and a base impact score, return the
   * nearest corresponding likelihood object that meets the threshold.
   * This depends entirely on the sorted order of thresholds defined in the CMS
   * @param {*} sourceArray this is an array of object (likelihoods) obtained
   * from the CMS. It contains {name: 'xxx', value: '100', colour: 'edaaed'}
   * @param {*} score depends on usage: it might be the base impact score
   * obtained directly from the risk results, or it is a sum of weights
   * obtained from the selected controls.
   * @return object
   */
  lookupLikelihood (sourceArray, weightedImpactScore) {
    let output = {};
    // the use of `for ( let i of array)` is intentional. The loop needs to be
    // exited prematurely when the first threshold condition is met.
    // JavaScript's native array iterator methods won't do this.
    for (let likelihood of sourceArray) {
      let thresholdValue = +likelihood.value,
        likelihoodImpactScore = parseInt(weightedImpactScore);
      switch(likelihood.operator) {
        case '<=':
          if(Comparators.lte(likelihoodImpactScore, thresholdValue)) {
            return likelihood;
          };
          break;
        case '<':
          if(Comparators.lt(likelihoodImpactScore, thresholdValue)) {
            return likelihood;
          };
          break;
        case '>':
          if(Comparators.gt(likelihoodImpactScore, thresholdValue)) {
            return likelihood;
          };
          break;
        case '>=':
          if(Comparators.gte(likelihoodImpactScore, thresholdValue)) {
            return likelihood;
          };
          break;
      }

    }

    return output;
  }

  /**
   * Helper to display summary scores
   * @param {object} aspectSums with the following keys:
   * I = impact
   * L = likelihood
   * IP = impact penalty
   * LP = likelihood penalty
   */
  showComponentSelectionSummaryScores(aspectSums) {
    return (
      <small className="text-muted">
      <br/><strong>Sums</strong>
      <br/>
      Impact: {aspectSums.I},
      Likelihood: {aspectSums.L}
      <br/>
      IPenalty: {aspectSums.IP},
      LPenalty: {aspectSums.LP}
      </small>
    );
  }

  /**
   * Render the security risk assessment matrix as an HTML table
   */
  render() {
    const {
      tableData
    } = {...this.props};

    let likelihoodThresholds = tableData.LikelihoodThresholds;

    if(!likelihoodThresholds || likelihoodThresholds.length === 0) return [];

    likelihoodThresholds = TaskParser.parseLikelihoodJSONObject(likelihoodThresholds);

    return (
      <div className="RiskMatrix">
        <h3>Your risk assessment results</h3>

        <div className="table-responsive">
          <table className="table">
            <thead className="thead-light">
              <tr key="risk_matrix_legend_header">
                <th>Risk</th>
                <th>{tableData.Risks.length && tableData.Risks[0].HasAspects ? 'Product Aspect' : null}</th>
                <th>Current Controls</th>
                <th>Current Likelihood</th>
                <th>Current Impact</th>
                <th>Current Risk Rating</th>
                <th>Recommended Treatments</th>
              </tr>
            </thead>
            <tbody>
              {tableData.Risks.map((risk, topIndex) => {

                //TODO: this needs to be loaded from the security risk assessment table data
                const riskName = risk.Name,
                  riskScore = risk.BaseImpactScore,
                  riskID = risk.RiskID,
                  riskRating = risk.Rating,
                  riskColour = risk.Colour;

                //foreach aspect, make a table row. Only show risk on the first subinded
                return Object.entries(risk.Aspects).map((aspect, subindex) => {

                  //JSON-encoded associative arrays become objects, so we can't use Javascript array() methods
                  //aspect is first element of Object.entries array, the components are the last

                  const aspectName = aspect.shift(),
                    componentContainer = risk.HasAspects ? aspect.pop().pop() : aspect.pop(),
                    aspectSums = componentContainer ? componentContainer.Sum : null,
                    component = componentContainer ? componentContainer.Components : null;

                  if(!aspectSums || !component) return null;

                    //get all of our components, implemented controls, and recommended controls up front
                    //controls without weights are "not a valid control for that risk": we use filter()
                    //to remove these from the displayed controls

                    //filtering by selectedOption is done on frontend. Using backend will generate an extra DB query for
                    //every component.

                  //filter by DEFAULT_CVA_CONTROLS_ANSWER_YES controls that also have a calculated weight
                  const implementedControls = component.controls
                      .filter(control => control.selectedOption === CTL_STATUS_1)
                      .filter(control => risk.Weights[control.id] !== undefined),

                    //filter by DEFAULT_CVA_CONTROLS_ANSWER_NO controls that also have a calculated weight
                    recommendedControls = component.controls
                      .filter(control => control.selectedOption === CTL_STATUS_2)
                      .filter(control => risk.Weights[control.id] !== undefined),

                    //look up the current likelihood threshold, given the score calculated by this aspect's summary weights for likelihood
                    //this also accounts for penalties
                    currentLikelihood = this.lookupLikelihood(likelihoodThresholds, DEFAULT_SRA_MATRIX_THRESHOLD_SCORE - aspectSums.L + aspectSums.LP),

                    //look up the current impact threshold, given the score calculated by this aspect's summary weights for impact
                    //this also accounts for penalties
                    currentImpact = this.lookupLikelihood(likelihoodThresholds, riskScore - aspectSums.I + aspectSums.IP);

                  return (
                    <tr key={topIndex+'-'+subindex}>

                      {/* Display Risk name and base impact score */}
                      <td data-risk-id={riskID}>
                        {subindex === 0 ? riskName : null}
                        <small className="text-muted">{subindex === 0 ? '('+riskScore+')' : null}</small>
                        {!risk.HasAspects ? this.showComponentSelectionSummaryScores(aspectSums) : null}
                      </td>

                      <td>
                      {risk.HasAspects ? aspectName : null}
                      {risk.HasAspects ? this.showComponentSelectionSummaryScores(aspectSums) : null}
                      </td>

                      {/* Display Components name */}
                      <td>
                        <strong data-component-id={component.id}>{implementedControls.length ? component.name : false}</strong>

                        {/* Show implemented controls in this aspect */}
                        {implementedControls.map((control, subindex2) => {

                          //do not show penalty on implemented controls
                          const controlWeights = risk.Weights[control.id];
                          return (
                            <div key={topIndex+'-'+subindex+'-'+subindex2} data-control-id={control.id}>
                              {/* Display Control name and impact/likelihood scores */}
                              {control.name}
                              <small className="text-muted">(
                                I: {controlWeights.I},
                                L: {controlWeights.L}
                              )</small>

                            </div>
                          )
                        })}
                      </td>

                      {/* Display Likelihood rating and score */}
                      <td style={currentLikelihood ? {color: '#'+currentLikelihood.colour} : null}>
                        {currentLikelihood.name} {currentLikelihood ? '(' + (DEFAULT_SRA_MATRIX_THRESHOLD_SCORE - aspectSums.L + aspectSums.LP) + ')' : null}
                      <br/><small className="text-muted">{DEFAULT_SRA_MATRIX_THRESHOLD_SCORE} - {aspectSums.L} + {aspectSums.LP} = {DEFAULT_SRA_MATRIX_THRESHOLD_SCORE - aspectSums.L + aspectSums.LP}</small>
                      </td>

                      {/* Display Impact rating and score */}
                      <td style={currentImpact ? {color: '#'+currentImpact.colour} : null}>
                        {currentImpact.name} {currentImpact ? '(' + (riskScore - aspectSums.I + aspectSums.IP) + ')' : null}
                      <br/><small className="text-muted">{riskScore} - {aspectSums.I} + {aspectSums.IP} = {riskScore - aspectSums.I + aspectSums.IP}</small>
                      </td>

                      {/* Display Risk rating and score */}
                      <td style={riskColour ? {backgroundColor: riskColour} : null}>
                        {riskRating ? riskRating : null}
                      </td>

                      {/* Show recommended controls in this aspect */}
                      <td>
                        <strong data-component-id={component.id}>{recommendedControls.length ? component.name : false}</strong>

                        {recommendedControls.map((control, subindex2) => {
                          //only show penalty on recommended controls
                          const controlWeights = risk.Weights[control.id];
                          return (
                            <div key={topIndex+'-'+subindex+'-'+subindex2} data-control-id={control.id}>
                              {/* Display Control name and impact/likelihood scores */}
                              {control.name}
                              <small className="text-muted">(
                                IP: {controlWeights.IP},
                                LP: {controlWeights.LP}
                              )</small>
                            </div>
                          )
                        })}
                      </td>
                    </tr>
                  )
                });
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default RiskAssessmentMatrixTableContainer;
