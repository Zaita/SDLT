// @flow
import ActionType from "../actions/ActionType";

const initalState: QuestionnaireSubmissionListState = {
  awaitingApprovalList: [],
  awaitingApprovalTaskList: [],
  mySubmissionList: [],
  myProductList: [],
}

export function questionnaireSubmissionListState(state: QuestionnaireSubmissionListState = initalState, action: any): QuestionnaireSubmissionListState {
  if (action.type === ActionType.QUESTIONNAIRE.FETCH_AWAITING_APPROVAL_LIST_SUCCESS) {
    return {
      ...state,
      awaitingApprovalList: action.payload
    };
  }

  if (action.type === ActionType.TASK.FETCH_AWAITING_APPROVAL_TASK_LIST_SUCCESS) {
    return {
      ...state,
      awaitingApprovalTaskList: action.payload
    };
  }

  if (action.type === ActionType.QUESTIONNAIRE.FETCH_MY_SUBMISSION_LIST_SUCCESS) {
    return {
      ...state,
      mySubmissionList: action.payload
    };
  }

  if (action.type === ActionType.QUESTIONNAIRE.FETCH_MY_PRODUCT_LIST_SUCCESS) {
    return {
      ...state,
      myProductList: action.payload
    };
  }

  return state;
}
