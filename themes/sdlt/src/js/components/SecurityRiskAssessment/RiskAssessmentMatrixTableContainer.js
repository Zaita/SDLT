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
   * Render the security risk assessment matrix as an HTML table
   */
  render() {
    const {
      tableData
    } = {...this.props};

    if (!tableData) {
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
                {tableData.Risks.length && tableData.Risks[0].HasAspects &&
                  (<th>Product Aspect</th>)}
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
                      .filter(control => risk.Weights[control.id] !== undefined);

                  return (
                    <tr key={topIndex+'-'+subindex}>

                      {/* Display Risk name and base impact score */}
                      <td data-risk-id={riskID}>
                        {subindex === 0 ? riskName : null}
                        <small className="text-muted">{subindex === 0 ? ' ('+riskScore+')' : null}</small>
                      </td>
                      {risk.HasAspects &&(<td>{aspectName}</td>)}

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
                                I: {control.Weights.I},
                                L: {control.Weights.L}
                              )</small>

                            </div>
                          )
                        })}
                      </td>

                      {/* Display Likelihood rating and score */}
                      <td style={componentContainer.currentLikelihoodColour ? {color: componentContainer.currentLikelihoodColour} : null}>
                      {componentContainer.currentLikelihoodName} {componentContainer.currentLikelihoodName ? '(' + (componentContainer.currentLikelihoodScore) + ')' : null}
                      <br/><small className="text-muted">max(1, ({DEFAULT_SRA_MATRIX_THRESHOLD_SCORE} - {aspectSums.L}) + {aspectSums.LP}) = {componentContainer.currentLikelihoodScore}</small>
                      </td>

                      {/* Display Impact rating and score */}
                      <td style={componentContainer.currentImpactColour ? {color: componentContainer.currentImpactColour} : null}>
                        {componentContainer.currentImpactName} {componentContainer.currentImpactName ? '(' + (componentContainer.currentImpactScore) + ')' : null}
                      <br/><small className="text-muted">max(1, ({riskScore} - {aspectSums.I}) + {aspectSums.IP}) = {componentContainer.currentImpactScore}</small>
                      </td>

                      {/* Display Risk rating and score */}
                      <td style={componentContainer.riskRatingColour ? {backgroundColor: componentContainer.riskRatingColour} : null}>
                        {componentContainer.riskRatingName ? componentContainer.riskRatingName : null}
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
                                I: {control.Weights.I},
                                L: {control.Weights.L},
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
