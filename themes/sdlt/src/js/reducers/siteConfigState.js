// @flow

import type {SiteConfigState} from "../store/SiteConfigState";
import type {LoadSiteConfigAction} from "../actions/ActionType";
import ActionType from "../actions/ActionType";

const defaultState: SiteConfigState = {
  siteConfig: null,
};

export function siteConfigState(state: SiteConfigState = defaultState, action: LoadSiteConfigAction) {
  switch (action.type) {
    case ActionType.SITE_CONFIG.LOAD_SITE_CONFIG:
      return {
        ...state,
        siteConfig: action.payload
      };
    default:
      return state;
  }
}
