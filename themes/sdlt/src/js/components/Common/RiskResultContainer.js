// @flow
import React, {Component} from "react";
import type {RiskResult} from "../../types/Questionnaire";

type Props = {
  riskResults: RiskResult | null,
};

class RiskResultContainer extends Component<Props> {
  render() {
    const {riskResults} = {...this.props};

    if (riskResults.length === 0) {
      return null;
    }

    return (
      <div className="risks">
        <h3>Risk Result</h3>

        <div className="table-responsive">
          <table className="table">
            <thead className="thead-light">
              <tr key="risk_table_header">
                <th>Risk Name</th>
                <th>Weights</th>
                <th>Score</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {riskResults.map((riskResult, index): RiskResult => {
                return (
                  <tr key={index+1} style={{backgroundColor:'#' + riskResult.colour}}>
                    <td>
                      {riskResult.riskName}
                    </td>
                    <td>
                      {riskResult.weights}
                    </td>
                    <td>
                      {riskResult.score}
                    </td>
                    <td>
                      {riskResult.rating}
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

export default RiskResultContainer;
