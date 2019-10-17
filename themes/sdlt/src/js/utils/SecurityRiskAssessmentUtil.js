import React, {Component} from "react";
import {Submission} from "../types/Questionnaire"
import {
  SRA_IS_FINALISED_MESSAGE
} from '../constants/values';


export default class SecurityRiskAssessmentUtil {
  static isSRATaskFinalised(allTaskSubmissions) {
    return allTaskSubmissions.filter(
      (ts) => ts.TaskType === 'security risk assessment' && ts.Status === 'complete'
    ).length > 0;
  };

  static isSiblingTaskPending(allTaskSubmissions) {
    const status = ['start', 'in_progress', 'waiting_for_approval'];
    return allTaskSubmissions.filter(
      (ts) => ts.TaskType !== 'security risk assessment' && status.includes(ts.Status)
    ).length > 0;
  };

  static getSraIsFinalisedAlert() {
    return (
      <div className="alert alert-success text-center">
        {SRA_IS_FINALISED_MESSAGE}
      </div>
    );
  };
}
