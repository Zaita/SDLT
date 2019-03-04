// @flow

import {combineReducers} from "redux";
import type {RootState} from "../store/RootState";
import {homeState} from "./homeState";

export default combineReducers<RootState>({
  homeState,
});
