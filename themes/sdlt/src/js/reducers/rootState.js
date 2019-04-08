// @flow

import {combineReducers} from "redux";
import type {RootState} from "../store/RootState";
import {homeState} from "./homeState";
import questionnaireState from "./questionnaireState";
import {taskSubmissionState} from "./taskSubmissionState";
import {currentUserState} from "./currentUserState";
import {siteConfigState} from "./siteConfigState";

export default combineReducers<RootState>({
  homeState,
  questionnaireState,
  taskSubmissionState,
  currentUserState,
  siteConfigState
});
