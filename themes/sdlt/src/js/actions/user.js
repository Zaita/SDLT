// @flow

import {ThunkAction} from "redux-thunk";
import type {SetCurrentUserAction} from "./ActionType";
import ActionType from "./ActionType";
import UserDataService from "../services/UserDataService";
import ErrorUtil from "../utils/ErrorUtil";

export function loadCurrentUser(): ThunkAction {
  return async (dispatch) => {
    // TODO: loading
    try {
      const user = await UserDataService.fetchCurrentUser();
      const action: SetCurrentUserAction = {
        type: ActionType.USER.SET_CURRENT_USER,
        payload: user,
      };
      dispatch(action);
    }
    catch (error) {
      // TODO: errors
      ErrorUtil.displayError(error);
    }
  };
}
