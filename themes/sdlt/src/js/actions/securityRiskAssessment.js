import {ThunkAction} from "redux-thunk";
import ActionType from "./ActionType";
import SecurityRiskAssessmentTaskDataService from "../services/SecurityRiskAssessmentTaskDataService";
import ErrorUtil from "../utils/ErrorUtil";

export function loadSecurityRiskAssessment(args: {uuid: string, secureToken?: string}): ThunkAction {
  const {uuid, secureToken} = {...args};

  return async (dispatch) => {
    await dispatch({ type: ActionType.SRA.LOAD_SECURITY_RISK_ASSESSMENT_REQUEST});
    try {
      const payload = await SecurityRiskAssessmentTaskDataService.fetchSecurityRiskAssessmentTasK({
        uuid,
        secureToken
      });

      const action = {
        type: ActionType.SRA.LOAD_SECURITY_RISK_ASSESSMENT_SUCCESS,
        payload,
      };

      await dispatch(action);
    }
    catch (error) {
      await dispatch({type: ActionType.SRA.LOAD_SECURITY_RISK_ASSESSMENT_FAILURE, error: error});
      ErrorUtil.displayError(error);
    }
  };
}

export function loadImapctThreshold() {
    return async (dispatch) => {
    try {
      const payload = await SecurityRiskAssessmentTaskDataService.fetchImpactThreshold();

      const action = {
        type: ActionType.SRA.LOAD_IMPACT_THRESHOLD,
        payload,
      };

      await dispatch(action);
    }
    catch (error) {
      ErrorUtil.displayError(error);
    }
  };
}
