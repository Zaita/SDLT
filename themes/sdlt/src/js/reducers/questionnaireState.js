// @flow

import {combineReducers} from "redux";
import type {
  QuestionnaireStartState,
  QuestionnaireState,
  QuestionnaireSubmissionState,
} from "../store/QuestionnaireState";
import type {LoadQuestionnaireStartAction} from "../actions/ActionType";
import ActionType from "../actions/ActionType";

const defaultStartState: QuestionnaireStartState = {
  title: "",
  subtitle: "",
  keyInformation: "",
  questionnaireID: "",
  user: null
};

export function startState(state: QuestionnaireStartState = defaultStartState, action: LoadQuestionnaireStartAction) {
  if (action.type === ActionType.QUESTIONNAIRE.LOAD_QUESTIONNAIRE_START_STATE) {
    return action.payload;
  }
  return state;
}

// TODO: write real reducer
export function submissionState(state: QuestionnaireSubmissionState = {}, action: *) {
  return state;
}

export default combineReducers<QuestionnaireState>({
  startState,
  submissionState
});
