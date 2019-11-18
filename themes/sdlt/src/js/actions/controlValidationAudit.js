// @flow
import {ThunkAction} from "redux-thunk";
import ActionType from "./ActionType";
import ControlValidationAuditDataService from "../services/ControlValidationAuditDataService";
import ErrorUtil from "../utils/ErrorUtil";
import CSRFTokenService from "../services/CSRFTokenService";
import URLUtil from "../utils/URLUtil";

export function loadControlValidationAudit(args: {uuid: string, secureToken?: string}): ThunkAction {
  const {uuid, secureToken} = {...args};

  return async (dispatch) => {
    await dispatch({ type: ActionType.CVA.LOAD_CONTROL_VALIDATION_AUDIT_REQUEST});

    try {
      // Clear CVA data first from store
      await dispatch( {
        type: ActionType.CVA.EMPTY_CONTROL_VALIDATION_AUDIT_DATA,
        payload: null, // make the data empty
      });

      const payload = await ControlValidationAuditDataService.fetchControlValidationAuditTaskSubmission({
        uuid,
        secureToken
      });

      // Save data in store
      const action = {
        type: ActionType.CVA.LOAD_CONTROL_VALIDATION_AUDIT_SUCCESS,
        payload,
      };

      await dispatch(action);
    }
    catch (error) {
      await dispatch({ type: LOAD_CONTROL_VALIDATION_AUDIT_FAILURE, error: error});
      ErrorUtil.displayError(error);
    }
  };
}

export function saveControlValidationAuditData(uuid: string, controlData?: object, questionnaireSubmissionUUID: string, secureToken: string): ThunkAction {
  return async (dispatch) => {
    try {
      // Get CSRF token
      const csrfToken = await CSRFTokenService.getCSRFToken();

      // Call save data api
      const payload = await ControlValidationAuditDataService.saveControlValidationAuditData({
        uuid,
        controlData,
        csrfToken
      });

      const action = {
        type: ActionType.CVA.SAVE_CONTROL_VALIDATION_AUDIT_DATA,
        payload,
      };

      await dispatch(action);
      URLUtil.redirectToQuestionnaireSummary(questionnaireSubmissionUUID, secureToken);
    }
    catch (error) {
      ErrorUtil.displayError(error);
    }
  };
}

export function updateControlValidationAuditData(args: {selectedOption: string, controlID: string, componentID: string, productAspect: string}): ThunkAction {
  return async (dispatch) => {
    const action = {
      type: ActionType.CVA.UPDATE_CONTROL_VALIDATION_AUDIT_DATA,
      payload: args
    };
    await dispatch(action);
  }
}

export function reSyncWithJira (uuid: string) : ThunkAction {
  return async (dispatch) => {
    await dispatch({ type: ActionType.CVA.RE_SYNC_WITH_JIRA_REQUEST});

    try {
      // Get CSRF token
      const csrfToken = await CSRFTokenService.getCSRFToken();

      // Call re sync with jira data api
      const payload = await ControlValidationAuditDataService.reSyncWithJira({
        uuid,
        csrfToken
      });

      const action = {
        type: ActionType.CVA.RE_SYNC_WITH_JIRA_SUCCESS,
        payload,
      };

      await dispatch(action);
    }
    catch (error) {
      await dispatch({ type: RE_SYNC_WITH_JIRA_FAILURE, error: error});
      ErrorUtil.displayError(error);
    }
  }
}
