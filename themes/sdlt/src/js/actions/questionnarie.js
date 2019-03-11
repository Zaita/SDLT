// @flow

import type {QuestionnaireStartState, QuestionnaireSubmissionState} from "../store/QuestionnaireState";
import ActionType from "./ActionType";
import type {LoadQuestionnaireStartAction, LoadQuestionnaireSubmissionAction} from "./ActionType";
import {ThunkAction} from "redux-thunk";
import QuestionnaireDataService from "../services/QuestionnaireDataService";
import type {Question} from "../types/Questionnaire";
import type {RootState} from "../store/RootState";
import CSRFTokenService from "../services/CSRFTokenService";

// Start

export function loadQuestionnaireStartState(questionnaireID: string): ThunkAction {
  return async (dispatch) => {
    // TODO: maybe dispatch a global loading action
    try {
      const data = await QuestionnaireDataService.fetchStartData(questionnaireID);
      dispatch(loadQuestionnaireStartStateFinished(data));
    } catch (error) {
      // TODO: maybe dispatch a global error action
      alert(error);
    }
  };
}

export function loadQuestionnaireStartStateFinished(payload: QuestionnaireStartState): LoadQuestionnaireStartAction {
  return {
    type: ActionType.QUESTIONNAIRE.LOAD_QUESTIONNAIRE_START_STATE,
    payload
  }
}

// Submission

export function createInProgressSubmission(questionnaireID: string): ThunkAction {
  return async (dispatch) => {
    // TODO: maybe dispatch a global loading action
    try {
      // Get CSRF token
      const csrfToken = await CSRFTokenService.getCSRFToken();

      // Send request to create submission record
      const submissionHash = await QuestionnaireDataService.createInProgressSubmission({questionnaireID, csrfToken});

      // Redirect to questionnaire page
      window.location.href = `/#/questionnaire/submission/${submissionHash}`;

    } catch (error) {
      // TODO: maybe dispatch a global error action
      alert(error);
    }
  };
}

export function loadQuestionnaireSubmissionState(submissionHash: string): ThunkAction {
  return async (dispatch) => {
    // TODO: maybe dispatch a global loading action
    try {
      const data = await QuestionnaireDataService.fetchSubmissionData(submissionHash);
      dispatch(loadQuestionnaireSubmissionStateFinished(data));
    } catch (error) {
      // TODO: maybe dispatch a global error action
      alert(error);
    }
  };
}

export function loadQuestionnaireSubmissionStateFinished(payload: QuestionnaireSubmissionState): LoadQuestionnaireSubmissionAction {
  return {
    type: ActionType.QUESTIONNAIRE.LOAD_QUESTIONNAIRE_SUBMISSION_STATE,
    payload
  }
}

export function putDataInQuestionnaireAnswer(payload: Question) {
  return {
    type: ActionType.QUESTIONNAIRE.PUT_DATA_IN_QUESTIONNAIRE_ANSWER,
    payload
  };
}

export function moveAfterQuestionAnswered(answeredQuestion: Question): ThunkAction {
  return async (dispatch, getState) => {
    let targetIndex = null;
    const nonApplicableIndexes = [];

    const rootState: RootState = getState();
    const submission = rootState.questionnaireState.submissionState.submission;
    if (!submission) {
      return;
    }

    const currentIndex = submission.questions.findIndex((question) => question.id === answeredQuestion.id);

    // TODO: if it is already the last question, move to review page
    if (currentIndex === submission.questions.length - 1) {
      alert("This is the last question");
      return;
    }

    // If answered question is input type, move to next question
    if (answeredQuestion.type === "input") {
      targetIndex = currentIndex + 1;
    }

    // TODO: If answered question is action type, move to the defined target
    if (answeredQuestion.type === "action") {
      if (!answeredQuestion.actions) {
        return;
      }

      const choseAction = answeredQuestion.actions.find((item) => {
        return item.isChose;
      });
      if (!choseAction) {
        return;
      }

      // "continue" | "goto" | "message" | "finish"
      if (choseAction.type === "finish") {
        // TODO: if it is already the last question, move to review page
        alert("This action trigger finish early");
        return;
      }
      if (choseAction.type === "message") {
        // Display message, don't move
        return;
      }
      if (choseAction.type === "continue") {
        targetIndex = currentIndex + 1;
      }
      if (choseAction.type === "goto") {
        // Go to another question, need to mark questions between current and target to be non-applicable
        const targetID = choseAction.goto;
        targetIndex = submission.questions.findIndex((item) => {
          return item.id === targetID;
        });

        // Don't move if the target index is wrong
        if (targetIndex <= currentIndex) {
          return;
        }

        // Find questions between target and current to be "not applicable"
        if (targetIndex - currentIndex > 1) {
          let cursor = currentIndex + 1;
          while (cursor < targetIndex) {
            nonApplicableIndexes.push(cursor);
            cursor++;
          }
        }
      }
    }

    if (!targetIndex) {
      alert("Can't find a target question");
      return;
    }

    dispatch({
      type: ActionType.QUESTIONNAIRE.MOVE_TO_ANOTHER_QUESTIONNAIRE_QUESTION,
      targetIndex,
      nonApplicableIndexes
    });

    // TODO: Network request
  };
}

export function moveToPreviousQuestion(targetQuestion: Question): ThunkAction {
  return async (dispatch, getState) => {
    const rootState: RootState = getState();
    const submission = rootState.questionnaireState.submissionState.submission;
    if (!submission) {
      return;
    }

    // Don't move if the target question is not applicable or doesn't have answer
    if (!targetQuestion.isApplicable || !targetQuestion.hasAnswer) {
      return;
    }

    const targetIndex = submission.questions.findIndex((question) => question.id === targetQuestion.id);
    if (targetIndex < 0) {
      return;
    }

    dispatch({
      type: ActionType.QUESTIONNAIRE.MOVE_TO_ANOTHER_QUESTIONNAIRE_QUESTION,
      targetIndex,
    });

    // TODO: Network request
  };
}
