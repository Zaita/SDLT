// @flow
import ActionType from "../actions/ActionType";

const initalState: QuestionnaireSubmissionListState = {
  awaitingApprovalList: [],
  mySubmissionList: [],
  myProductList: [],
}

export function questionnaireSubmissionListState(state: QuestionnaireSubmissionListState = initalState, action: any): QuestionnaireSubmissionListState {
  if (action.type === ActionType.QUESTIONNAIRE.FETCH_AWAITING_APPROVAL_LIST) {
    return {
      ...state,
      awaitingApprovalList: action.payload
    };
  }

  if (action.type === ActionType.QUESTIONNAIRE.FETCH_MY_SUBMISSION_LIST) {
    return {
      ...state,
      mySubmissionList: action.payload
    };
  }

  if (action.type === ActionType.QUESTIONNAIRE.FETCH_MY_PRODUCT_LIST) {
    return {
      ...state,
      myProductList: action.payload
    };
  }

  return state;
}
