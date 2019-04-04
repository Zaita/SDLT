// @flow

import {ThunkAction} from "redux-thunk";
import TaskDataService from "../services/TaskDataService";
import ActionType from "./ActionType";
import type {Question} from "../types/Questionnaire";
import SubmissionDataUtil from "../utils/SubmissionDataUtil";
import _ from "lodash";
import CSRFTokenService from "../services/CSRFTokenService";
import type {TaskSubmission} from "../types/Task";
import ErrorUtil from "../utils/ErrorUtil";
import type {
  LoadTaskSubmissionAction,
  MarkQuestionsNotApplicableInTaskSubmissionAction, MoveToQuestionInTaskSubmissionAction,
  PutDataInTaskSubmissionAction,
} from "./ActionType";

export function loadTaskSubmission(args: {uuid: string, secureToken?: string}): ThunkAction {
  const {uuid, secureToken} = {...args};

  return async (dispatch) => {
    try {
      const payload = await TaskDataService.fetchTaskSubmission({
        uuid,
        secureToken
      });
      const action: LoadTaskSubmissionAction = {
        type: ActionType.TASK.LOAD_TASK_SUBMISSION,
        payload,
      };
      await dispatch(action);
    }
    catch (error) {
      ErrorUtil.displayError(error);
    }
  };
}

export function saveAnsweredQuestionInTaskSubmission(args: {answeredQuestion: Question, secureToken?: string}): ThunkAction {
  const {answeredQuestion, secureToken} = {...args};

  return async (dispatch, getState) => {

    const getTaskSubmission = () => {
      return getState().taskSubmissionState.taskSubmission;
    };

    if (!getTaskSubmission()) {
      return;
    }

    // Save local state
    const putDataAction: PutDataInTaskSubmissionAction = {
      type: ActionType.TASK.PUT_DATA_IN_TASK_SUBMISSION,
      payload: answeredQuestion,
    };
    await dispatch(putDataAction);

    // Network request - save answer
    try {
      await TaskDataService.batchUpdateTaskSubmissionData({
        uuid: getTaskSubmission().uuid,
        questionIDList: [answeredQuestion.id],
        answerDataList: [SubmissionDataUtil.transformFromFullQuestionToData(answeredQuestion)],
        csrfToken: await CSRFTokenService.getCSRFToken(),
        secureToken: secureToken,
      });
    } catch (error) {
      ErrorUtil.displayError(error);
    }

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
      questions: getTaskSubmission().questions,
    });

    // Mark non applicable questions
    if (nonApplicableIndexes.length > 0) {
      const markNotApplicableAction: MarkQuestionsNotApplicableInTaskSubmissionAction = {
        type: ActionType.TASK.MARK_TASK_QUESTION_NOT_APPLICABLE,
        payload: nonApplicableIndexes,
      };
      await dispatch(markNotApplicableAction);
    }

    // Move cursor
    if (targetIndex > currentIndex) {
      const moveAction: MoveToQuestionInTaskSubmissionAction = {
        type: ActionType.TASK.MOVE_TO_ANOTHER_TASK_QUESTION,
        payload: {currentIndex, targetIndex},
      };
      await dispatch(moveAction);
    }

    // Network request - batch update
    try {
      await batchUpdateTaskSubmissionData(
        getTaskSubmission(),
        _.uniq([currentIndex, ...nonApplicableIndexes, targetIndex]),
        secureToken
      );
    } catch(error) {
      ErrorUtil.displayError(error);
    }

    if (complete) {
      try {
        const csrfToken = await CSRFTokenService.getCSRFToken();

        // Prevent anonymous user to create other task submissions according to the answers
        if (!secureToken) {
          await TaskDataService.createTaskSubmissionsAccordingToQuestions({
            questions: getTaskSubmission().questions,
            questionnaireSubmissionID: getTaskSubmission().questionnaireSubmissionID,
            csrfToken
          });
        }

        const {uuid} = await TaskDataService.completeTaskSubmission({
          uuid: getTaskSubmission().uuid,
          result: result,
          secureToken: secureToken,
          csrfToken
        });

        await dispatch(loadTaskSubmission({uuid, secureToken}));
      } catch (error) {
        ErrorUtil.displayError(error);
      }
    }
  };
}

export function moveToPreviousQuestionInTaskSubmission(args: {targetQuestion: Question, secureToken?: string}): ThunkAction {
  const {targetQuestion, secureToken} = {...args};
  return async (dispatch, getState) => {
    const taskSubmission: TaskSubmission = getState().taskSubmissionState.taskSubmission;

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
    const moveAction: MoveToQuestionInTaskSubmissionAction = {
      type: ActionType.TASK.MOVE_TO_ANOTHER_TASK_QUESTION,
      payload: {currentIndex, targetIndex},
    };
    await dispatch(moveAction);

    // Network request - batch update
    await batchUpdateTaskSubmissionData(
      taskSubmission,
      _.uniq([currentIndex, targetIndex]),
      secureToken
    );
  };
}

export function editCompletedTaskSubmission(args: {secureToken?: string} = {}): ThunkAction {
  const {secureToken} = {...args};
  return async (dispatch, getState) => {
    const taskSubmission: TaskSubmission = getState().taskSubmissionState.taskSubmission;
    if (!taskSubmission) {
      return;
    }

    const {uuid} = await TaskDataService.editTaskSubmission({
      uuid: taskSubmission.uuid,
      csrfToken: await CSRFTokenService.getCSRFToken(),
      secureToken: secureToken,
    });
    await dispatch(loadTaskSubmission({uuid, secureToken}));
  };
}

async function batchUpdateTaskSubmissionData(taskSubmission: TaskSubmission, indexesToUpdate: Array<number>, secureToken?: string) {
  try {
    await TaskDataService.batchUpdateTaskSubmissionData({
      uuid: taskSubmission.uuid,
      questionIDList: indexesToUpdate.map((index) => taskSubmission.questions[index].id),
      answerDataList: indexesToUpdate.map((index) => SubmissionDataUtil.transformFromFullQuestionToData(taskSubmission.questions[index])),
      csrfToken: await CSRFTokenService.getCSRFToken(),
      secureToken: secureToken,
    });
  } catch (error) {
    ErrorUtil.displayError(error.message);
  }
}
