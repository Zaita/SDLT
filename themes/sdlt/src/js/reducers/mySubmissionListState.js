// @flow
import ActionType from "../actions/ActionType";

const initalState: MySubmissionListState = {
  submissionList: []
}

export function mySubmissionListState(state: MySubmissionListState = initalState, action: any): MySubmissionListState {
  if (action.type === ActionType.QUESTIONNAIRE.FETCH_MY_SUBMISSION_LIST) {
    return {
      ...state,
      mySubmissionList: action.payload
    };
  }

  return state;
}
