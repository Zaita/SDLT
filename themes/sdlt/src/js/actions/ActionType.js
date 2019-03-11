// @flow


import type {HomeState} from "../store/HomeState";
import {Action} from "redux";
import type {QuestionnaireStartState, QuestionnaireSubmissionState} from "../store/QuestionnaireState";

export type LoadHomeStateFinishedAction = Action & {
  payload: HomeState
}

export type LoadHomeStateFailedAction = Action & {
  error: Error
}

export type LoadHomeStateAction = Action | LoadHomeStateFinishedAction | LoadHomeStateFailedAction;

export type LoadQuestionnaireStartAction = {
  type: string,
  payload: QuestionnaireStartState
}

export type LoadQuestionnaireSubmissionAction = {
  type: string,
  payload: QuestionnaireSubmissionState
}

const ActionType = {
  HOME: {
    LOAD_HOME_STATE_STARTED: "LOAD_HOME_STATE_STARTED",
    LOAD_HOME_STATE_FAILED: "LOAD_HOME_STATE_FAILED",
    LOAD_HOME_STATE_FINISHED: "LOAD_HOME_STATE_FINISHED",
  },
  QUESTIONNAIRE: {
    LOAD_QUESTIONNAIRE_START_STATE: "LOAD_QUESTIONNAIRE_START_STATE",
    LOAD_QUESTIONNAIRE_SUBMISSION_STATE: "LOAD_QUESTIONNAIRE_SUBMISSION_STATE",
    PUT_DATA_IN_QUESTIONNAIRE_ANSWER: "PUT_DATA_IN_QUESTIONNAIRE_ANSWER",
    MOVE_TO_ANOTHER_QUESTIONNAIRE_QUESTION: "MOVE_TO_ANOTHER_QUESTIONNAIRE_QUESTION",
  },
  // TODO: add a global UI state to reflect loading and error
  UI: {
    LOAD_DATA_STARTED: "LOAD_DATA_STARTED",
    LOAD_DATA_FAILED: "LOAD_DATA_FAILED",
    LOAD_DATA_FINISHED: "LOAD_DATA_FINISHED"
  }
};

export default ActionType;
