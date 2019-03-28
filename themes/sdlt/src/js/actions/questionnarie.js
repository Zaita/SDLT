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
import TaskDataService from "../services/TaskDataService";

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

      // Move cursor
      dispatch(moveAfterQuestionAnswered(payload));
    } catch (error) {
      // TODO: error handling
      alert(error.message);
    }
  };
}

export function moveAfterQuestionAnswered(answeredQuestion: Question): ThunkAction {
  return async (dispatch, getState) => {
    const rootState: RootState = getState();
    const submission = rootState.questionnaireState.submissionState.submission;
    if (!submission) {
      return;
    }

    const {
      currentIndex,
      targetIndex,
      nonApplicableIndexes,
      complete
    } = SubmissionDataUtil.getDataUpdateIntent({
      answeredQuestion,
      questions: submission.questions
    });

    // Mark non applicable questions
    if (nonApplicableIndexes.length > 0) {
      dispatch({
        type: ActionType.QUESTIONNAIRE.MARK_QUESTIONNAIRE_QUESTION_NOT_APPLICABLE,
        nonApplicableIndexes
      });
    }

    // Move cursor if target question is valid
    if (targetIndex > currentIndex) {
      dispatch({
        type: ActionType.QUESTIONNAIRE.MOVE_TO_ANOTHER_QUESTIONNAIRE_QUESTION,
        targetIndex
      });
    }

    // Batch update states for all related questions to cloud
    await batchUpdateSubmissionData(getState(), _.uniq([currentIndex, ...nonApplicableIndexes, targetIndex]));

    if (complete) {
      URLUtil.redirectToQuestionnaireReview(submission.submissionUUID);
    }
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

export function submitQuestionnaire(): ThunkAction {
  return async (dispatch, getState) => {
    try {
      const rootState: RootState = getState();
      const submissionState = rootState.questionnaireState.submissionState;
      const submission = submissionState.submission;
      if (!submission) {
        return;
      }

      // Check if the questionnaire is answered properly (only have answered and non-applicable questions)
      if (SubmissionDataUtil.existsUnansweredQuestion(submission.questions)) {
        alert("There are questions not answered properly, please check your answers");
        return;
      }

      const csrfToken = await CSRFTokenService.getCSRFToken();
      const {uuid} = await QuestionnaireDataService.submitQuestionnaire({submissionID: submission.submissionID, csrfToken});
      await TaskDataService.createTaskSubmissionsForQuestionnaireSubmission({questionnaireSubmission: submission, csrfToken});
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

export function approveQuestionnaireSubmission(submissionID: string): ThunkAction {
  return async (dispatch, getState) => {
    try {
      const csrfToken = await CSRFTokenService.getCSRFToken();
      const {uuid} = await QuestionnaireDataService.approveQuestionnaireSubmission({submissionID, csrfToken});
      dispatch(loadQuestionnaireSubmissionState(uuid));
    } catch(error) {
      // TODO: errors
      alert(error);
    }
  }
}

export function denyQuestionnaireSubmission(submissionID: string): ThunkAction {
  return async (dispatch, getState) => {
    try {
      const csrfToken = await CSRFTokenService.getCSRFToken();
      const {uuid} = await QuestionnaireDataService.denyQuestionnaireSubmission({submissionID, csrfToken});
      dispatch(loadQuestionnaireSubmissionState(uuid));
    } catch(error) {
      // TODO: errors
      alert(error);
    }
  }
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
