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

    console.log(riskRatingThresholds);

    return (
      <div className="RiskRatingLegend">
        <h3>Risk Rating Matix</h3>

        <div className="table-responsive">
          <p className="impact-heading">Impact</p>

          <table className="table table-sm table-bordered">
            <thead className="thead-light">
              <tr key="risk_rating_legend_header">
              {
                riskRatingThresholds.tableHeader.map((headerText, index) => {
                  return (
                    <th key={index}>
                      {headerText}
                    </th>
                  )
                })
              }
              </tr>
            </thead>
            <tbody>
              {
                riskRatingThresholds.tableRows.map((row, rowIndex) => {
                  return (
                    <tr key={'row_' + rowIndex}>
                      {
                        row.map((column, columnIndex) => {
                          return(
                            <td
                              key={'column_'+columnIndex}
                              style={column.color ? {backgroundColor: column.color} : null}
                            >
                            {column.name}
                            </td>
                          )
                        })
                      }
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default RiskRatingThresholdContainer;
