// @flow


import type {HomeState} from "../store/HomeState";
import {Action} from "redux";

export type LoadHomeStateFinishedAction = Action & {
  payload: HomeState
}

export type LoadHomeStateFailedAction = Action & {
  error: Error
}

export type LoadHomeStateAction = Action | LoadHomeStateFinishedAction | LoadHomeStateFailedAction;

const ActionType = {
  HOME: {
    LOAD_HOME_STATE_STARTED: "LOAD_HOME_STATE_STARTED",
    LOAD_HOME_STATE_FAILED: "LOAD_HOME_STATE_FAILED",
    LOAD_HOME_STATE_FINISHED: "LOAD_HOME_STATE_FINISHED",
  }
};

export default ActionType;
