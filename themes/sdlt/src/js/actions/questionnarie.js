// @flow

import type {QuestionnaireStartState} from "../store/QuestionnaireState";
import ActionType from "./ActionType";
import type {LoadQuestionnaireStartAction} from "./ActionType";
import {ThunkAction} from "redux-thunk";
import QuestionnaireDataService from "../services/QuestionnaireDataService";

export function loadQuestionnaireStartState(questionnaireID: string): ThunkAction {
  return async (dispatch) => {
    // TODO: maybe dispatch a global loading action
    try {
      const data = await QuestionnaireDataService.fetchStartData(questionnaireID);
      dispatch(loadQuestionnaireStartStateFinished(data));
    } catch (error) {
      // TODO: maybe dispatch a global error action
      console.error(error);
    }
  };
}

export function loadQuestionnaireStartStateFinished(payload: QuestionnaireStartState): LoadQuestionnaireStartAction {
  return {
    type: ActionType.QUESTIONNAIRE.LOAD_QUESTIONNAIRE_START_STATE,
    payload
  }
}
