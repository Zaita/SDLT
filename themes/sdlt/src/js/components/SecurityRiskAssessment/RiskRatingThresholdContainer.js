// @flow
import React, {Component} from "react";
import type {RiskRatingThreshold} from "../../types/Task";

type Props = {
  riskRatingThresholds: Array<RiskRatingThreshold> | null,
};

class RiskRatingThresholdContainer extends Component<Props> {
  render() {
    const {riskRatingThresholds} = {...this.props};

    if(!riskRatingThresholds || riskRatingThresholds.length === 0) {
      return null;
    }

    return (
      <div className="RiskRatingLegend">
        <h3>Risk Rating Legend</h3>

        <div className="table-responsive">
          <table className="table table-sm">
            <thead className="thead-light">
              <tr key="risk_rating_legend_header">
                <th>Likelihood</th>
                <th>Imapct</th>
                <th>Risk Rating</th>
              </tr>
            </thead>
            <tbody>
              {riskRatingThresholds.map((threshold, index): Array<RiskRatingThreshold> => {
                return (
                  <tr key={index+1}>
                    <td>
                      {threshold.likelihood}
                    </td>
                    <td>
                      {threshold.impact}
                    </td>
                    <td style={{backgroundColor:'#' + threshold.color}}>
                      {threshold.riskRating}
                    </td>
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

export default RiskRatingThresholdContainer;
