// @flow

import type {HomeState} from "../store/HomeState";
import ActionType from "./ActionType";
import type {LoadHomeStateFailedAction, LoadHomeStateFinishedAction} from "./ActionType";
import {ThunkAction} from "redux-thunk";
import HomeDataService from "../services/HomeDataService";
import {Action} from "redux";

export function loadHomeState(): ThunkAction {
  return async (dispatch) => {
    // TODO: maybe dispatch a global loading action
    dispatch(loadingHomeState());

    try {
      const homeState = await HomeDataService.fetchHomeData();
      dispatch(loadedHomeState(homeState));
    } catch (error) {
      dispatch(failedHomeState(error));
      // TODO: maybe dispatch a global error action
      // TODO: maybe better error alert
      console.error(error);
      alert(error.message);
    }
  };
}

export function loadingHomeState(): Action {
  return {
    type: ActionType.HOME.LOAD_HOME_STATE_STARTED
  };
}

export function failedHomeState(error: Error): LoadHomeStateFailedAction {
  return {
    type: ActionType.HOME.LOAD_HOME_STATE_FAILED,
    error: error
  };
}

export function loadedHomeState(homeState: HomeState): LoadHomeStateFinishedAction {
  return {
    type: ActionType.HOME.LOAD_HOME_STATE_FINISHED,
    payload: homeState
  };
}
