// @flow
import React, {Component} from "react";
import type {ImpactThreshold} from "../../types/ImpactThreshold";

type Props = {
  impactThresholds: Array<ImpactThreshold> | null,
};

class ImpactThresholdContainer extends Component<Props> {
  render() {
    const {impactThresholds} = {...this.props};

    if(!impactThresholds || impactThresholds.length === 0) {
      return null;
    }

    return (
      <div className="ImapctLegend">
        <h3>Impact Legend</h3>

        <div className="table-responsive">
          <table className="table table-sm">
            <thead className="thead-light">
              <tr key="impact_legend_header">
                <th>Threshold</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {impactThresholds.map((impactThreshold, index): Array<ImpactThreshold> => {
                return (
                  <tr key={index+1}>
                    <td>
                      {impactThreshold.operator + impactThreshold.value}
                    </td>
                    <td style={{backgroundColor:'#' + impactThreshold.color}}>
                      {impactThreshold.name}
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

export default ImpactThresholdContainer;
