// @flow

import {combineReducers} from "redux";
import type {RootState} from "../store/RootState";
import {homeState} from "./homeState";
import questionnaireState from "./questionnaireState";
import {taskSubmissionState} from "./taskSubmissionState";

export default combineReducers<RootState>({
  homeState,
  questionnaireState,
  taskSubmissionState
});
