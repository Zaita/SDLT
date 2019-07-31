// @flow

import type {HomeState} from "../store/HomeState";
import type {QuestionnaireStartState, QuestionnaireSubmissionState} from "../store/QuestionnaireState";
import type {User} from "../types/User";
import type {TaskSubmission} from "../types/Task";
import type {Question} from "../types/Questionnaire";
import type {JiraTicket, SecurityComponent} from "../types/SecurityComponent";

export type LoadHomeStateFinishedAction = {
  type: string,
  payload: HomeState
}

export type LoadQuestionnaireStartAction = {
  type: string,
  payload: QuestionnaireStartState
}

export type LoadQuestionnaireSubmissionAction = {
  type: string,
  payload: QuestionnaireSubmissionState
}

export type LoadTaskSubmissionAction = {
  type: string,
  payload: TaskSubmission
};

export type PutDataInTaskSubmissionAction = {
  type: string,
  payload: Question
};

export type MarkQuestionsNotApplicableInTaskSubmissionAction = {
  type: string,
  payload: Array<number>
};

export type MoveToQuestionInTaskSubmissionAction = {
  type: string,
  payload: {
    currentIndex: number,
    targetIndex: number,
  }
};

export type SetCurrentUserAction = {
  type: string,
  payload: User | null
};

export type SetSiteTitleAction = {
  type: string,
  payload: string
};

export type LoadAvailableComponentsAction = {
  type: string,
  payload: Array<SecurityComponent>
}

export type AddSelectedComponentAction = {
  type: string,
  payload: string,
};

export type RemoveSelectedComponentAction = {
  type: string,
  payload: string,
};

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
    MARK_QUESTIONNAIRE_QUESTION_NOT_APPLICABLE: "MARK_QUESTIONNAIRE_QUESTION_NOT_APPLICABLE",
    FETCH_MY_SUBMISSION_LIST: "QUESTIONNAIRE/FETCH_MY_SUBMISSION_LIST",
    FETCH_AWAITING_APPROVAL_LIST: "QUESTIONNAIRE/FETCH_AWAITING_APPROVAL_LIST",
    FETCH_MY_PRODUCT_LIST:"QUESTIONNAIRE/FETCH_MY_PRODUCT_LIST",
  },
  TASK: {
    LOAD_TASK_SUBMISSION: "ACTION_TASK_LOAD_TASK_SUBMISSION",
    PUT_DATA_IN_TASK_SUBMISSION: "ACTION_TASK_PUT_DATA_IN_TASK_SUBMISSION",
    MARK_TASK_QUESTION_NOT_APPLICABLE: "ACTION_TASK_MARK_TASK_QUESTION_NOT_APPLICABLE",
    MOVE_TO_ANOTHER_TASK_QUESTION: "ACTION_TASK_MOVE_TO_ANOTHER_TASK_QUESTION",
    COMPLETE_TASK_SUBMISSION: "ACTION_TASK_COMPLETE_TASK_SUBMISSION",
    EDIT_TASK_SUBMISSION: "ACTION_TASK_EDIT_TASK_SUBMISSION",
  },
  COMPONENT_SELECTION: {
    SET_AVAILABLE_COMPONENTS: "ACTION_COMPONENT_SELECTION_SET_AVAILABLE_COMPONENTS",
    ADD_SELECTED_COMPONENT: "ACTION_COMPONENT_SELECTION_ADD_SELECTED_COMPONENT",
    REMOVE_SELECTED_COMPONENT: "ACTION_COMPONENT_SELECTION_REMOVE_SELECTED_COMPONENT",
    SET_JIRA_TICKETS: "ACTION_COMPONENT_SELECTION_SET_JIRA_TICKETS",
    SET_VIEW_MODE: "ACTION_COMPONENT_SELECTION_SET_VIEW_MODE"
  },
  // TODO: add a global UI state to reflect loading and error
  UI: {
    LOAD_DATA_STARTED: "LOAD_DATA_STARTED",
    LOAD_DATA_FAILED: "LOAD_DATA_FAILED",
    LOAD_DATA_FINISHED: "LOAD_DATA_FINISHED",
  },
  USER: {
    SET_CURRENT_USER: "ACTION_USER_SET_CURRENT_USER",
  },
  SITE_CONFIG: {
    SET_SITE_TITLE: "ACTION_SITE_CONFIG_SET_SITE_TITLE",
  },
};

export default ActionType;
