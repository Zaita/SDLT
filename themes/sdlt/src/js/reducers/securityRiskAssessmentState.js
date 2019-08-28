// @flow

import type {SecurityRiskAssessmentState} from "../store/SecurityRiskAssessmentState";
import ActionType from "../actions/ActionType";
import type {SecurityRiskAssessment} from "../types/Task";

const defaultStartState: SecurityRiskAssessmentState = {
  securityRiskAssessmentData: null,
};

export function securityRiskAssessmentState(state: SecurityRiskAssessmentState = defaultStartState, action: *): SecurityRiskAssessmentState {
  if (action.type === ActionType.SRA.LOAD_SECURITY_RISK_ASSESSMENT) {
    return {
      securityRiskAssessmentData: action.payload,
    };
  }
  return state;
}
