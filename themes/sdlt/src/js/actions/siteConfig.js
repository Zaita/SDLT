// @flow

import {ThunkAction} from "redux-thunk";
import type {SetSiteTitleAction} from "./ActionType";
import ActionType from "./ActionType";
import ErrorUtil from "../utils/ErrorUtil";
import SiteConfigDataService from "../services/SiteConfigDataService";

export function loadSiteTitle(): ThunkAction {
  return async (dispatch) => {
    // TODO: loading
    try {
      const siteConfig = await SiteConfigDataService.fetchSiteConfig();
      const action: SetSiteTitleAction = {
        type: ActionType.SITE_CONFIG.SET_SITE_TITLE,
        payload: siteConfig.siteTitle,
      };
      dispatch(action);
    }
    catch (error) {
      // TODO: errors
      ErrorUtil.displayError(error);
    }
  };
}
