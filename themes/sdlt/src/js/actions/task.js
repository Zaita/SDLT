// @flow

import {ThunkAction} from "redux-thunk";
import TaskDataService from "../services/TaskDataService";
import ActionType from "./ActionType";
import type {Question} from "../types/Questionnaire";
import SubmissionDataUtil from "../utils/SubmissionDataUtil";
import _ from "lodash";
import CSRFTokenService from "../services/CSRFTokenService";
import type {TaskSubmission} from "../types/Task";

export function loadTaskSubmissionState(uuid: string): ThunkAction {
  return async (dispatch) => {
    // TODO: loading
    try {
      const payload = await TaskDataService.fetchTaskSubmissionState(uuid);
      dispatch({
        type: ActionType.TASK.LOAD_TASK_SUBMISSION_STATE,
        payload,
      });
    }
    catch (error) {
      // TODO: errors
      alert(error);
    }
  };
}

export function saveAnsweredQuestion(answeredQuestion: Question): ThunkAction {
  return async (dispatch, getState) => {
    const taskSubmission: TaskSubmission = _.get(getState(), "taskSubmissionState.taskSubmission");
    if (!taskSubmission) {
      return;
    }

    // Save local state
    dispatch({
      type: ActionType.TASK.PUT_DATA_IN_TASK_SUBMISSION,
      payload: answeredQuestion,
    });

    // Network request - save answer
    await TaskDataService.batchUpdateTaskSubmissionData({
      uuid: taskSubmission.uuid,
      questionIDList: [answeredQuestion.id],
      answerDataList: [SubmissionDataUtil.transformFromFullQuestionToData(answeredQuestion)],
      csrfToken: await CSRFTokenService.getCSRFToken(),
    });

    // Move cursor
    const {
      currentIndex,
      nonApplicableIndexes,
      targetIndex,
      complete,
      terminate,
      result
    } = SubmissionDataUtil.getDataUpdateIntent({
      answeredQuestion,
      questions: taskSubmission.questions,
    });

    // Mark non applicable questions
    if (nonApplicableIndexes.length > 0) {
      dispatch({
        type: ActionType.TASK.MARK_TASK_QUESTION_NOT_APPLICABLE,
        payload: nonApplicableIndexes,
      });
    }

    // Move cursor
    if (targetIndex > currentIndex) {
      dispatch({
        type: ActionType.TASK.MOVE_TO_ANOTHER_TASK_QUESTION,
        payload: {currentIndex, targetIndex},
      });
    }

    // Network request - batch update
    await batchUpdateTaskSubmissionData(
      taskSubmission,
      _.uniq([currentIndex, ...nonApplicableIndexes, targetIndex])
    );

    if (complete) {
      const {uuid} = await TaskDataService.completeTaskSubmission({
        uuid: taskSubmission.uuid,
        result: result,
        csrfToken: await CSRFTokenService.getCSRFToken()
      });
      dispatch(loadTaskSubmissionState(uuid));
    }
  };
}

export function moveToPreviousQuestion(targetQuestion: Question): ThunkAction {
  return async (dispatch, getState) => {
    const taskSubmission: TaskSubmission = _.get(getState(), "taskSubmissionState.taskSubmission", null);
    if (!taskSubmission) {
      return;
    }

    const questions = taskSubmission.questions;
    const currentIndex = questions.findIndex((question) => question.isCurrent);
    if (currentIndex < 0) {
      throw new Error("Wrong state, please reload the task");
    }

    // Don't move if the target question is not applicable or doesn't have answer
    if (!targetQuestion.isApplicable || !targetQuestion.hasAnswer) {
      return;
    }

    const targetIndex = questions.findIndex((question) => question.id === targetQuestion.id);
    if (targetIndex < 0) {
      return;
    }

    // Move cursor
    dispatch({
      type: ActionType.TASK.MOVE_TO_ANOTHER_TASK_QUESTION,
      payload: {currentIndex, targetIndex},
    });

    // Network request - batch update
    await batchUpdateTaskSubmissionData(
      taskSubmission,
      _.uniq([currentIndex, targetIndex])
    );
  };
}

export function editCompletedTaskSubmission(): ThunkAction {
  return async (dispatch, getState) => {
    const taskSubmission: TaskSubmission = _.get(getState(), "taskSubmissionState.taskSubmission", null);
    if (!taskSubmission) {
      return;
    }

    const {uuid} = await TaskDataService.editTaskSubmission({
      uuid: taskSubmission.uuid,
      csrfToken: await CSRFTokenService.getCSRFToken()
    });
    dispatch(loadTaskSubmissionState(uuid));
  };
}

async function batchUpdateTaskSubmissionData(taskSubmission: TaskSubmission, indexesToUpdate: Array<number>) {
  try {
    await TaskDataService.batchUpdateTaskSubmissionData({
      uuid: taskSubmission.uuid,
      questionIDList: indexesToUpdate.map((index) => taskSubmission.questions[index].id),
      answerDataList: indexesToUpdate.map((index) => SubmissionDataUtil.transformFromFullQuestionToData(taskSubmission.questions[index])),
      csrfToken: await CSRFTokenService.getCSRFToken(),
    });
  } catch (error) {
    // TODO: error handling
    alert(error.message);
  }
}
