// @flow

import {combineReducers} from "redux";
import type {
  QuestionnaireStartState,
  QuestionnaireState,
  QuestionnaireSubmissionState,
} from "../store/QuestionnaireState";
import type {LoadQuestionnaireStartAction} from "../actions/ActionType";
import ActionType from "../actions/ActionType";
import type {Question} from "../types/Questionnaire";
import _ from "lodash";

const defaultStartState: QuestionnaireStartState = {
  title: "",
  subtitle: "",
  keyInformation: "",
  questionnaireID: "",
  user: null
};

const defaultSubmissionState: QuestionnaireSubmissionState = {
  title: "",
  subtitle: "",
  user: null,
  submission: null
};

export function startState(state: QuestionnaireStartState = defaultStartState, action: LoadQuestionnaireStartAction) {
  if (action.type === ActionType.QUESTIONNAIRE.LOAD_QUESTIONNAIRE_START_STATE) {
    return action.payload;
  }
  return state;
}

export function submissionState(state: QuestionnaireSubmissionState = defaultSubmissionState, action: *) {
  if (action.type === ActionType.QUESTIONNAIRE.LOAD_QUESTIONNAIRE_SUBMISSION_STATE) {
    return action.payload;
  }

  if (action.type === ActionType.QUESTIONNAIRE.PUT_DATA_IN_QUESTIONNAIRE_ANSWER) {
    if (!state.submission) {
      return state;
    }

    // Find the matched question
    const answeredQuestion: Question = action.payload;
    const index = state.submission.questions.findIndex((question) => {
      return question.id === answeredQuestion.id;
    });
    if (index < 0) {
      return state;
    }

    const newState = {...state};
    _.set(newState, `submission.questions.${index}`, answeredQuestion);
    return newState;
  }

  if (action.type === ActionType.QUESTIONNAIRE.MOVE_TO_ANOTHER_QUESTIONNAIRE_ANSWER) {
    const submission = state.submission;
    if (!submission) {
      return state;
    }

    const targetIndex = action.targetIndex;
    const currentIndex = submission.questions.findIndex((question) => {
      return question.isCurrent;
    });

    // Don't move when target is wrong
    if (targetIndex <= currentIndex || targetIndex >= submission.questions.length) {
      return state;
    }

    const newState = {...state};

    // Mark current question is not current anymore
    _.set(newState, `submission.questions.${currentIndex}.isCurrent`, false);

    // Mark questions between target and current to be "not applicable"
    if (targetIndex - currentIndex > 1) {
      let cursor = currentIndex + 1;
      while (cursor < targetIndex) {
        const nonApplicableQuestion = submission.questions[cursor];
        nonApplicableQuestion.isApplicable = false;
        _.set(newState, `submission.questions.${cursor}`, nonApplicableQuestion);
        cursor++;
      }
    }

    // Mark target question to be current
    _.set(newState, `submission.questions.${targetIndex}.isCurrent`, true);

    return newState;
  }

  return state;
}

export default combineReducers<QuestionnaireState>({
  startState,
  submissionState
});
