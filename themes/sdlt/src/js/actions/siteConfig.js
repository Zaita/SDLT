// @flow

import {ThunkAction} from "redux-thunk";
import type {LoadSiteConfigAction} from "./ActionType";
import ActionType from "./ActionType";
import ErrorUtil from "../utils/ErrorUtil";
import SiteConfigDataService from "../services/SiteConfigDataService";

export function loadSiteConfig(): ThunkAction {
  return async (dispatch) => {
    // TODO: loading
    try {
      const siteConfig = await SiteConfigDataService.fetchSiteConfig();
      const action: LoadSiteConfigAction = {
        type: ActionType.SITE_CONFIG.LOAD_SITE_CONFIG,
        payload: siteConfig,
      };
      dispatch(action);
    }
    catch (error) {
      // TODO: errors
      ErrorUtil.displayError(error);
    }
  };
}
