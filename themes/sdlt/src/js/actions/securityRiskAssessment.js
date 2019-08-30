import {ThunkAction} from "redux-thunk";
import ActionType from "./ActionType";
import SecurityRiskAssessmentTaskDataService from "../services/SecurityRiskAssessmentTaskDataService";
import ErrorUtil from "../utils/ErrorUtil";

export function loadSecurityRiskAssessment(args: {uuid: string, secureToken?: string}): ThunkAction {
  const {uuid, secureToken} = {...args};

  return async (dispatch) => {
    try {
      const payload = await SecurityRiskAssessmentTaskDataService.fetchSecurityRiskAssessmentTasK({
        uuid,
        secureToken
      });

      const action = {
        type: ActionType.SRA.LOAD_SECURITY_RISK_ASSESSMENT,
        payload,
      };

      await dispatch(action);
    }
    catch (error) {
      ErrorUtil.displayError(error);
    }
  };
}
