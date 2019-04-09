// @flow

import type {HomeState} from "../store/HomeState";
import type {LoadHomeStateFinishedAction} from "../actions/ActionType";
import ActionType from "../actions/ActionType";

const defaultState: HomeState = {
  title: "",
  subtitle: "",
  pillars: [],
  tasks: [],
};

export function homeState(state: HomeState = defaultState, action: LoadHomeStateFinishedAction) {
  switch (action.type) {
    case ActionType.HOME.LOAD_HOME_STATE_FINISHED:
      return action.payload;
    default:
      return state;
  }
}
