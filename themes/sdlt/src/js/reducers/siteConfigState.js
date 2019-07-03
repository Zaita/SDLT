// @flow

import type {SiteConfigState} from "../store/SiteConfigState";
import type {SetSiteTitleAction} from "../actions/ActionType";
import ActionType from "../actions/ActionType";

const defaultState: SiteConfigState = {
  siteTitle: "",
};

export function siteConfigState(state: SiteConfigState = defaultState, action: SetSiteTitleAction) {
  switch (action.type) {
    case ActionType.SITE_CONFIG.SET_SITE_TITLE:
      return {
        ...state,
        siteTitle: action.payload
      };
    default:
      return state;
  }
}
