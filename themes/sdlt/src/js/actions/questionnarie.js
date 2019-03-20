// @flow

import type {QuestionnaireStartState, QuestionnaireSubmissionState} from "../store/QuestionnaireState";
import ActionType from "./ActionType";
import type {LoadQuestionnaireStartAction, LoadQuestionnaireSubmissionAction} from "./ActionType";
import {ThunkAction} from "redux-thunk";
import QuestionnaireDataService from "../services/QuestionnaireDataService";
import type {
  Question,
  Submission,
  SubmissionActionData,
  SubmissionInputData,
  SubmissionQuestionData,
} from "../types/Questionnaire";
import type {RootState} from "../store/RootState";
import CSRFTokenService from "../services/CSRFTokenService";
import _ from "lodash";
import SubmissionDataUtil from "../utils/SubmissionDataUtil";
import URLUtil from "../utils/URLUtil";

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
      const uuid = await QuestionnaireDataService.createInProgressSubmission({questionnaireID, csrfToken});

      // Redirect to questionnaire page
      URLUtil.redirectToQuestionnaireEditing(uuid);

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

// TODO: split big functions

export function putDataInQuestionnaireAnswer(payload: Question): ThunkAction {
  return async (dispatch, getState) => {

    // Save local state
    dispatch({
      type: ActionType.QUESTIONNAIRE.PUT_DATA_IN_QUESTIONNAIRE_ANSWER,
      payload
    });

    const rootState: RootState = getState();
    const submissionID = _.get(rootState, "questionnaireState.submissionState.submission.submissionID", null);
    if (!submissionID) {
      throw new Error("Something is wrong, please reload the page");
    }

    const csrfToken = await CSRFTokenService.getCSRFToken();
    const questionID = payload.id;
    const answerData: SubmissionQuestionData = SubmissionDataUtil.transformFromFullQuestionToData(payload);

    // Update state of current answered question in cloud
    try {
      await QuestionnaireDataService.updateSubmissionData({
        submissionID,
        questionID,
        csrfToken,
        answerData
      });
    } catch (error) {
      // TODO: error handling
      alert(error.message);
    }

    // Move cursor
    dispatch(moveAfterQuestionAnswered(payload));
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

    // If it is already the last question, move to review page
    if (currentIndex === submission.questions.length - 1) {
      URLUtil.redirectToQuestionnaireReview(submission.submissionUUID);
      return;
    }

    // If answered question is input type, move to next question
    if (answeredQuestion.type === "input") {
      targetIndex = currentIndex + 1;
    }

    // If answered question is action type, move to the defined target
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
        // Mark all questions later to be non-applicable
        for (let i = currentIndex + 1; i < submission.questions.length; i++) {
          nonApplicableIndexes.push(i);
        }

        dispatch({
          type: ActionType.QUESTIONNAIRE.MARK_QUESTIONNAIRE_QUESTION_NOT_APPLICABLE,
          nonApplicableIndexes
        });

        await batchUpdateSubmissionData(getState(), nonApplicableIndexes);

        // Move to review page
        URLUtil.redirectToQuestionnaireReview(submission.submissionUUID);
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

        if (nonApplicableIndexes.length > 0) {
          dispatch({
            type: ActionType.QUESTIONNAIRE.MARK_QUESTIONNAIRE_QUESTION_NOT_APPLICABLE,
            nonApplicableIndexes
          });
        }
      }
    }

    if (!targetIndex) {
      throw new Error("Can't find a target question");
    }

    dispatch({
      type: ActionType.QUESTIONNAIRE.MOVE_TO_ANOTHER_QUESTIONNAIRE_QUESTION,
      targetIndex
    });

    // Batch update states for all related questions to cloud
    await batchUpdateSubmissionData(getState(), [currentIndex, ...nonApplicableIndexes, targetIndex]);
  };
}

export function moveToPreviousQuestion(targetQuestion: Question): ThunkAction {
  return async (dispatch, getState) => {
    const rootState: RootState = getState();
    const submission = rootState.questionnaireState.submissionState.submission;
    if (!submission) {
      return;
    }

    const currentIndex = submission.questions.findIndex((question) => question.isCurrent);
    if (currentIndex < 0) {
      throw new Error("Wrong state, please reload the questionnaire");
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

    // Batch update states for all related questions to cloud ("current" cursor changes)
    await batchUpdateSubmissionData(getState(), [currentIndex, targetIndex]);
  };
}

export function submitQuestionnaire(submissionID: string): ThunkAction {
  return async (dispatch, getState) => {
    try {
      const csrfToken = await CSRFTokenService.getCSRFToken();
      const {uuid} = await QuestionnaireDataService.submitQuestionnaire({submissionID, csrfToken});
      URLUtil.redirectToQuestionnaireSummary(uuid);
    } catch(error) {
      // TODO: errors
      alert(error);
    }
  };
}

export function submitQuestionnaireForApproval(submissionID: string): ThunkAction {
  return async (dispatch, getState) => {
    try {
      const csrfToken = await CSRFTokenService.getCSRFToken();
      const {uuid} = await QuestionnaireDataService.submitQuestionnaireForApproval({submissionID, csrfToken});
      dispatch(loadQuestionnaireSubmissionState(uuid));
    } catch(error) {
      // TODO: errors
      alert(error);
    }
  };
}

// Commons

async function batchUpdateSubmissionData(rootState: RootState, indexesToUpdate: Array<number>) {
  const submission = rootState.questionnaireState.submissionState.submission;
  if (!submission) {
    return;
  }

  const csrfToken = await CSRFTokenService.getCSRFToken();
  try {
    await QuestionnaireDataService.batchUpdateSubmissionData({
      submissionID: submission.submissionID,
      questionIDList: indexesToUpdate.map((index) => submission.questions[index].id),
      answerDataList: indexesToUpdate.map((index) => SubmissionDataUtil.transformFromFullQuestionToData(submission.questions[index])),
      csrfToken,
    });
  } catch (error) {
    // TODO: error handling
    alert(error.message);
  }
}
