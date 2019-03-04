// @flow

import type {HomeState} from "../store/HomeState";
import ActionType from "../actions/ActionType";
import type {LoadHomeStateAction} from "../actions/ActionType";

const defaultState: HomeState = {
  title: "",
  subtitle: "",
  pillars: []
};

export function homeState(state: HomeState = defaultState, action: LoadHomeStateAction) {
  switch (action.type) {
    case ActionType.HOME.LOAD_HOME_STATE_STARTED:
      return state;
    case ActionType.HOME.LOAD_HOME_STATE_FAILED:
      return state;
    case ActionType.HOME.LOAD_HOME_STATE_FINISHED:
      return action.payload;
    default:
      return state;
  }
}
