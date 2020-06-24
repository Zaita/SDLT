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
import _toInteger from "lodash/toInteger";

type Props = {
  calculatedSRAData: object,
  hasProductAspect: boolean
};

class RiskAssessmentMatrixTableContainer extends Component<Props> {
  /**
   * Render the security risk assessment matrix as an HTML table
   */
   renderTableHeader()
   {
      return (
        <tr key="sra_header">
          <th>Risk</th>
          {this.props.hasProductAspects && (<th>Product Aspect</th>)}
          <th>Current Controls</th>
          <th>Current Likelihood</th>
          <th>Current Impact</th>
          <th>Current Risk Rating</th>
          <th>Recommended Treatments</th>
        </tr>
      )
   }

  renderTableBody()
  {
    if (this.props.hasProductAspects) {
      return this.props.calculatedSRAData.map((risk, riskIndex) => {
        return risk.productAspects.map((productAspect, productAspectIndex) =>{
          const rowData = {
            riskId: risk.riskId,
            riskName: productAspectIndex == 0 ? `${risk.riskName} (${risk.baseImpactScore})` : null,
            riskDescription: productAspectIndex == 0 ? risk.description : null,
            components: productAspect.components,
            currentLikelihood: productAspect.currentLikelihood,
            currentImpact: productAspect.currentImpact,
            currentRiskRating: productAspect.currentRiskRating
          };

          return this.renderTableRow(rowData, productAspect.productAspectName);
        });
      });
    } else {
      return this.props.calculatedSRAData.map((risk, riskIndex) => {
        const rowData = {
          riskId: risk.riskId,
          riskName: `${risk.riskName} (${risk.baseImpactScore})`,
          riskDescription: risk.description,
          components: risk.riskDetail.components,
          currentLikelihood: risk.riskDetail.currentLikelihood,
          currentImpact: risk.riskDetail.currentImpact,
          currentRiskRating: risk.riskDetail.currentRiskRating
        };

        return this.renderTableRow(rowData);
      });
    }
  }

  renderTableRow(rowData, productAspect = '')
  {
    return (
      <tr key={productAspect + '_' + rowData.riskId}>
        <td>
          <span style={{display:'block'}}>{rowData.riskName}</span>
          <small className="text-muted">{rowData.riskDescription}</small>
        </td>
        {this.props.hasProductAspects && productAspect && (<td>{productAspect}</td>)}
        <td>
          {this.renderComponents(rowData.components, 'Implemented')}
        </td>
        <td>
          {this.renderCurrentLikelihood(rowData.currentLikelihood)}
        </td>
        <td>
          {this.renderCurrentImapct(rowData.currentImpact)}
        </td>
        <td
          style={rowData.currentRiskRating.colour ? {backgroundColor: rowData.currentRiskRating.colour} : null}
        >
          {this.renderCurrentRiskRating(rowData.currentRiskRating)}
        </td>
        <td>
          {this.renderComponents(rowData.components, 'Recommened')}
        </td>
      </tr>
    );
  }

  renderComponents(components, type) {
    if(!components || !Array.isArray(components) || components.length == 0) {
      return null;
    }

    return components.map((component, componentIndex) =>{
      const controls = (type === 'Implemented' ? component.implementedControls : component.recommendedControls);

      return (
        <div key={componentIndex+1}>
          <strong key={component.id}>{controls.length> 0 ? component.name : null}</strong>
          {controls.length> 0 && this.renderControls(controls, type)}
        </div>
      )
    });
  }

  renderControls(controls, type) {
    return controls.map((control, controlIndex) => {
      let displayInBold = false;

      if ( type == "Recommened" &&
        (_toInteger(control.likelihoodPenalty) > 0 || _toInteger(control.impactPenalty) > 0)) {
        displayInBold = true;
      }

      return(
        <div key={controlIndex+1}>
          <span
            key={control.id}
            className={`${displayInBold ? "font-weight-bold control-title" : "font-weight-normal control-title"}`}
          >
            {control.name} &nbsp;
          </span>
          <small className="text-muted">
            (
              L: {control.likelihoodWeight},
              I: {control.impactWeight},
              LP: {control.likelihoodPenalty},
              IP: {control.impactPenalty}
            )
          </small>
        </div>
      );
    });
  }

  renderCurrentLikelihood(currentLikelihood) {
    return (
      <div>
        <span style={currentLikelihood.colour ? {color: currentLikelihood.colour, display:'block'} : null}>
          {currentLikelihood.name} {currentLikelihood.score ? '(' + (currentLikelihood.score) + ')' : null}
        </span>
        <small className="text-muted">{currentLikelihood.formula}</small>
      </div>
    );
  }

  renderCurrentImapct(currentImapct) {
    return (
      <div>
        <span style={currentImapct.colour ? {color: currentImapct.colour, display:'block'} : null}>
          {currentImapct.name} {currentImapct.score ? '(' + (currentImapct.score) + ')' : null}
        </span>
        <small className="text-muted">{currentImapct.formula}</small>
      </div>
    );
  }

  renderCurrentRiskRating(currentRiskRating) {
    return (
      <div>
        {currentRiskRating.name}
      </div>
    );
  }

  render() {
    if(!this.props.calculatedSRAData) {
      return null;
    }

    return (
      <div className="RiskMatrix">
        <h3>Your risk assessment results</h3>

        <div className="table-responsive">
          <table className="table">
            <thead className="thead-light">
              {this.renderTableHeader()}
            </thead>
            <tbody>
              {this.renderTableBody()}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default RiskAssessmentMatrixTableContainer;
