// @flow
import React, {Component} from "react";
import type {LikelihoodThreshold} from "../../types/Task";
import {DEFAULT_SRA_MATRIX_THRESHOLD_SCORE} from "../../constants/values";
import Comparators from "../../utils/Comparators";

type Props = {
  RiskResults: Array<RiskResult> | null,
  LikelihoodThresholds: Array<LikelihoodThreshold> | null,
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
   * Sum of Likelihood Weights for this Risk
   * TODO: sum will be 0 until an array of controls with weights is present
   * @param {*} arrayOfRiskControls this is expected to be an array of
   * SecurityControl objects with a value called "weight"
   * @return number
   */
  sumOfLikelihoodWeightsForRisk(arrayOfRiskControls) {
    let sumOfLikelihoodWeights = 0;
    arrayOfRiskControls.map((control, index) => {
      sumOfLikelihoodWeights += parseInt(control.weight);
    });

    return sumOfLikelihoodWeights;

  }

  /**
   * Normalise calculated risk score from a float to an integer
   * This truncates the float from the decimal point - it does not do any
   * rounding.
   * @param {*} rawScore calculated base impact score, may contain decimals
   * @return number
   */
  baseImpactScore(rawScore) {
    return parseInt(rawScore);
  }

  /**
   * Augment the risk results array with additional values
   * @param {*} riskResults an array of RiskResults objects
   * @param {*} likelihoodThresholds an array of LikelihoodThreshold objects
   * @return array of RiskResult objects, with calculated scores embedded in
   * each object
   */
  combinedResults (riskResults, likelihoodThresholds) {
    riskResults.map((r, i) => {
      riskResults[i].baseImpactScore = this.baseImpactScore(r.score);
      riskResults[i].sumOfLikelihoodWeightsForRisk = this.sumOfLikelihoodWeightsForRisk(
        [] //TODO: array of controls expected
      );
      riskResults[i].likelihood = this.lookupLikelihood(
        likelihoodThresholds,
        DEFAULT_SRA_MATRIX_THRESHOLD_SCORE - riskResults[i].sumOfLikelihoodWeightsForRisk
      );
      riskResults[i].impact = this.lookupLikelihood(
        likelihoodThresholds,
        riskResults[i].baseImpactScore
      );
    });
    return riskResults;
  }

  /**
   * Render the security risk assessment matrix as an HTML table
   */
  render() {
    const {riskResults, likelihoodThresholds} = {...this.props};
    const combinedResults = this.combinedResults(riskResults, likelihoodThresholds);

    if (likelihoodThresholds.length === 0) {
      return null;
    }

    return (
      <div className="RiskMatrix">
        <h3>Your risk assessment results</h3>

        <div className="table-responsive">
          <table className="table">
            <thead className="thead-light">
              <tr key="risk_matrix_legend_header">
                <th>Risk</th>
                <th>Current Controls</th>
                <th>Current Likelihood</th>
                <th>Current Impact</th>
                <th>Current Risk Rating</th>
                <th>Recommended Treatments</th>
              </tr>
            </thead>
            <tbody>
              {combinedResults.map((riskResult, index): Array<RiskResult> => {
                return (
                  <tr key={index+1}>
                    <td> {riskResult.riskName} {riskResult.baseImpactScore ? ' (' + riskResult.baseImpactScore + ')' : '' } </td>
                    <td>  </td>
                    <td style={{color: '#'+riskResult.likelihood.colour}}>  {riskResult.likelihood.name ? riskResult.likelihood.name + ' (' + riskResult.likelihood.value + ')' : ''} </td>
                    <td style={{color: '#'+riskResult.impact.colour}}>  {riskResult.impact.name ? riskResult.impact.name + ' (' + riskResult.baseImpactScore + ')' : ''} </td>
                    <td style={{backgroundColor: '#'+riskResult.colour}}> {riskResult.rating} </td>
                    <td>  </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default RiskAssessmentMatrixTableContainer;
