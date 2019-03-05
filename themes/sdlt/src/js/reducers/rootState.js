// @flow

import {combineReducers} from "redux";
import type {RootState} from "../store/RootState";
import {homeState} from "./homeState";
import questionnaireState from "./questionnaireState";

export default combineReducers<RootState>({
  homeState,
  questionnaireState
});
