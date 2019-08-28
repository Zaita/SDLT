// @flow
import React, {Component} from "react";
import type {LikelihoodThreshold} from "../../types/Task";

type Props = {
  LikelihoodThresholds: Array<LikelihoodThreshold> | null,
};

class LikelihoodLegendContainer extends Component<Props> {
  render() {
    const {likelihoodThresholds} = {...this.props};

    if (likelihoodThresholds.length === 0) {
      return null;
    }

    return (
      <div className="LikelihoodLegend">
        <h3>Likelihood Legend</h3>

        <div className="table-responsive">
          <table className="table">
            <thead className="thead-light">
              <tr key="likelihood_legend_header">
                <th>Value</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {likelihoodThresholds.map((likelihoodThreshold, index): Array<LikelihoodThreshold> => {
                return (
                  <tr key={index+1}>
                    <td>
                      {likelihoodThreshold.operator + likelihoodThreshold.value}
                    </td>
                    <td style={{color:'#' + likelihoodThreshold.colour}}>
                      {likelihoodThreshold.name}
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

export default LikelihoodLegendContainer;
