// @flow

import type {CurrentUserState} from "../store/CurrentUserState";
import type {SetCurrentUserAction} from "../actions/ActionType";
import ActionType from "../actions/ActionType";

const defaultState: CurrentUserState = {
  user: null,
};

export function currentUserState(state: CurrentUserState = defaultState, action: SetCurrentUserAction) {
  switch (action.type) {
    case ActionType.USER.SET_CURRENT_USER:
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
}
