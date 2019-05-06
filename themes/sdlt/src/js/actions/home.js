// @flow

import type {LoadHomeStateFinishedAction} from "./ActionType";
import ActionType from "./ActionType";
import {ThunkAction} from "redux-thunk";
import HomeDataService from "../services/HomeDataService";
import ErrorUtil from "../utils/ErrorUtil";

export function loadHomeState(): ThunkAction {
  return async (dispatch) => {
    try {
      const homeState = await HomeDataService.fetchHomeData();
      const action: LoadHomeStateFinishedAction = {
        type: ActionType.HOME.LOAD_HOME_STATE_FINISHED,
        payload: homeState,
      };
      dispatch(action);
    }
    catch (error) {
      ErrorUtil.displayError(error);
    }
  };
}
