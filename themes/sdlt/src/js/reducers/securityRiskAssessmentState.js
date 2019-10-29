// @flow

import type {SecurityRiskAssessmentState} from "../store/SecurityRiskAssessmentState";
import ActionType from "../actions/ActionType";
import type {SecurityRiskAssessment} from "../types/Task";

const defaultStartState: SecurityRiskAssessmentState = {
  securityRiskAssessmentData: null,
  impactThresholdData: null
};

export function securityRiskAssessmentState(state: SecurityRiskAssessmentState = defaultStartState, action: *): SecurityRiskAssessmentState {

  if (action.type === ActionType.SRA.LOAD_SECURITY_RISK_ASSESSMENT) {
    return {
      ...state,
      securityRiskAssessmentData: action.payload
    };
  }

  if (action.type === ActionType.SRA.LOAD_IMPACT_THRESHOLD) {
    return {
      ...state,
      impactThresholdData: action.payload,
    };
  }

  return state;
}
