// @flow

import {ThunkAction} from "redux-thunk";
import TaskDataService from "../services/TaskDataService";
import ActionType from "./ActionType";
import type {Question} from "../types/Questionnaire";
import SubmissionDataUtil from "../utils/SubmissionDataUtil";
import _ from "lodash";
import CSRFTokenService from "../services/CSRFTokenService";
import type {Task, TaskSubmission} from "../types/Task";
import ErrorUtil from "../utils/ErrorUtil";
import type {
  LoadTaskSubmissionAction,
  MarkQuestionsNotApplicableInTaskSubmissionAction,
  MoveToQuestionInTaskSubmissionAction,
  PutDataInTaskSubmissionAction,
} from "./ActionType";
import {loadSelectedComponents} from "./componentSelection";
import type {User} from "../types/User";
import type {RootState} from "../store/RootState";
import URLUtil from "../utils/URLUtil";

export function loadTaskSubmission(args: {uuid: string, secureToken?: string, type?: string}): ThunkAction {
  const {uuid, secureToken, type} = {...args};

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

      if (type === "componentSelection") {
        await dispatch(loadSelectedComponents(payload));
      }
    }
    catch (error) {
      ErrorUtil.displayError(error);
    }
  };
}

export function loadStandaloneTaskSubmission(args: {taskId: string}): ThunkAction {
  const {taskId} = {...args};

  return async (dispatch, getState) => {
    try {
      const task = await TaskDataService.fetchStandaloneTask({taskId});

      const payload: TaskSubmission = {
        id: "",
        uuid: "",
        taskName: task.name,
        taskType: "questionnaire",
        status: "in_progress",
        result: "",
        questions: task.questions,
        selectedComponents: [],
        jiraTickets: [],
        questionnaireSubmissionUUID: "",
        questionnaireSubmissionID: "",
        submitter: getState().currentUserState,
        lockWhenComplete: false
      };

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

export function saveAnsweredQuestionInTaskSubmission(
  args: {
    answeredQuestion: Question,
    secureToken?: string,
    bypassNetwork?: boolean
  }): ThunkAction {
  const {answeredQuestion, secureToken, bypassNetwork} = {...args};

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
    if (!bypassNetwork) {
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
    if (!bypassNetwork) {
      try {
        await batchUpdateTaskSubmissionData(
          getTaskSubmission(),
          _.uniq([currentIndex, ...nonApplicableIndexes, targetIndex]),
          secureToken
        );
      } catch(error) {
        ErrorUtil.displayError(error);
      }
    }

    if (complete) {
      await dispatch(completeTaskSubmission({bypassNetwork, secureToken, result}));
    }
  };
}

/**
 * Obtain selected security controls from rootState and save to task submission
 *
 * @param {*} selectedControls
 */
export function saveCVASelectedControls(selectedControls: object): ThunkAction {
  return async (dispatch, getState) => {
    const rootState: RootState = getState();
    const taskSubmission = rootState.taskSubmissionState.taskSubmission;
    if (!taskSubmission) {
      return;
    }

    //@TODO: Complete graphql submission endpoint
  }
}

/**
 * Deals to both "JIRA Cloud" (remote) and SDLT (local) component submissions.
 */
export function saveSelectedComponents(jiraKey: string): ThunkAction {
  return async (dispatch, getState) => {
    const rootState: RootState = getState();
    const taskSubmission = rootState.taskSubmissionState.taskSubmission;
    if (!taskSubmission) {
      return;
    }

    await dispatch({ type: ActionType.TASK.SAVE_SELECTED_COMPONENT_REQUEST});

    const components = rootState.componentSelectionState.selectedComponents.map((component) => {
      return {
        SecurityComponentID : component.id,
        ProductAspect: component.productAspect,
        TaskSubmissionID: taskSubmission.id
      }
    });

    try {
      await TaskDataService.updateTaskSubmissionWithSelectedComponents({
        jiraKey,
        components,
        uuid: taskSubmission.uuid,
        csrfToken: await CSRFTokenService.getCSRFToken()
      });
      await dispatch(completeTaskSubmission());
      await dispatch({ type: ActionType.TASK.SAVE_SELECTED_COMPONENT_SUCCESS});
    } catch(error) {
      await dispatch({ type: ActionType.TASK.SAVE_SELECTED_COMPONENT_FAILURE});
      ErrorUtil.displayError(error);
    }
  };
}

export function completeTaskSubmission(args: {
  secureToken?: string,
  bypassNetwork?: boolean,
  result?: string,
  taskSubmissionUUID?: string | null,
  questionnaireUUID?: string | null,
} = {}): ThunkAction {
  const {secureToken, bypassNetwork, result, taskSubmissionUUID, questionnaireUUID} = {...args};

  return async (dispatch, getState) => {
    const getTaskSubmission = () => {
      return getState().taskSubmissionState.taskSubmission;
    };

    if (!bypassNetwork) {
      try {
        const csrfToken = await CSRFTokenService.getCSRFToken();

        const {uuid} = await TaskDataService.completeTaskSubmission({
          uuid: (taskSubmissionUUID === undefined) ? getTaskSubmission().uuid : taskSubmissionUUID,
          result: result || "",
          secureToken: secureToken,
          csrfToken
        });

        await dispatch(loadTaskSubmission({uuid, secureToken}));
        if(questionnaireUUID !== undefined) {
          URLUtil.redirectToQuestionnaireSummary(questionnaireUUID, secureToken)
        }
      } catch (error) {
        ErrorUtil.displayError(error);
      }
    } else {
      await dispatch({
        type: ActionType.TASK.COMPLETE_TASK_SUBMISSION,
        payload: result
      });
    }
  };
}

export function moveToPreviousQuestionInTaskSubmission(
  args: {
    targetQuestion: Question,
    secureToken?: string,
    bypassNetwork?: boolean
  }): ThunkAction {
  const {targetQuestion, secureToken, bypassNetwork} = {...args};

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
    if (!bypassNetwork) {
      await batchUpdateTaskSubmissionData(
        taskSubmission,
        _.uniq([currentIndex, targetIndex]),
        secureToken
      );
    }
  };
}

export function editCompletedTaskSubmission(
  args: {
    secureToken?: string,
    bypassNetwork?: boolean,
    type?: string,
  } = {}): ThunkAction {
  const {secureToken, bypassNetwork, type} = {...args};

  return async (dispatch, getState) => {
    const taskSubmission: TaskSubmission = getState().taskSubmissionState.taskSubmission;
    if (!taskSubmission) {
      return;
    }

    if (!bypassNetwork) {
      try {
        const {uuid} = await TaskDataService.editTaskSubmission({
          uuid: taskSubmission.uuid,
          csrfToken: await CSRFTokenService.getCSRFToken(),
          secureToken: secureToken,
        });
        await dispatch(loadTaskSubmission({uuid, secureToken}));

        if (type === "componentSelection") {
          await dispatch(loadSelectedComponents(taskSubmission));
        }

      } catch (error) {
        ErrorUtil.displayError(error);
      }
    } else {
      dispatch({
        type: ActionType.TASK.EDIT_TASK_SUBMISSION
      })
    }
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

export function approveTaskSubmission(uuid: string): ThunkAction {
  return async (dispatch, getState) => {
    try {
      const csrfToken = await CSRFTokenService.getCSRFToken();
      const {status} = await TaskDataService.approveTaskSubmission({uuid, csrfToken});
      await dispatch(loadTaskSubmission({uuid, secureToken: ''}));
    } catch(error) {
      ErrorUtil.displayError(error.message);
    }
  }
}

export function denyTaskSubmission(uuid: string): ThunkAction {
  return async (dispatch, getState) => {
    try {
      const csrfToken = await CSRFTokenService.getCSRFToken();
      const {status} = await TaskDataService.denyTaskSubmission({uuid, csrfToken});
      await dispatch(loadTaskSubmission({uuid}));
    } catch(error) {
      ErrorUtil.displayError(error.message);
    }
  }
}

// Questionnaire Submissions list of pending approval list
// for SA, CISO and Business owner
export function loadAwaitingApprovalTaskList(): ThunkAction {
  return async (dispatch: any, getState: () => RootState) => {
    const user = getState().currentUserState.user;
    if (!user) {
      return;
    }

    await dispatch({type: ActionType.TASK.FETCH_AWAITING_APPROVAL_TASK_LIST_REQUEST});

    try {
      // Call re sync with jira data api
      const data = await TaskDataService.fetchTaskSubmissionList(user.id, 'awaiting_approval_list');

      dispatch({
        type: ActionType.TASK.FETCH_AWAITING_APPROVAL_TASK_LIST_SUCCESS,
        payload: data
      });
    }
    catch (error) {
      await dispatch({ type: ActionType.TASK.FETCH_AWAITING_APPROVAL_TASK_LIST_FAILURE, error: error});
      ErrorUtil.displayError(error);
    }
  };
}
