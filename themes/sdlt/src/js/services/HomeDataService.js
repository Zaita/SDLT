// @flow

import type {HomeState} from "../store/HomeState";

import PocIcon from "../../img/Home/poc-icon.svg";
import SaasIcon from "../../img/Home/saas-icon.svg";
import ProdIcon from "../../img/Home/prod-icon.svg";
import BugIcon from "../../img/Home/bug-icon.svg";

import _ from "lodash";
import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import {DEFAULT_NETWORK_ERROR} from "../constants/errors";

export default class HomeDataService {

  static async fetchHomeData(): Promise<HomeState> {
    // GraphQL
    const query = `
query {
  readDashboard {
    Title
    Subtitle
    Pillars {
      Label
      Type
      Disabled
      Questionnaire {
        ID
      }
    }
  }
}`;

    // Send request
    const response = await GraphQLRequestHelper.prepareRequest(query).request();
    const json = response.data;
    const data = _.get(json, "data.readDashboard", []);
    if(!Array.isArray(data) || data.length === 0) {
      throw DEFAULT_NETWORK_ERROR;
    }

    // Parse data for use in frontend
    const dashboard = data[0];

    const title = _.get(dashboard, "Title", "");
    const subtitle = _.get(dashboard, "Subtitle", "");
    let pillars = _.get(dashboard, "Pillars", []);
    if(!Array.isArray(pillars)) {
      throw DEFAULT_NETWORK_ERROR;
    }
    pillars = pillars.map(item => {
      let icon = "";
      switch (item["Type"]) {
        case "proof_of_concept":
          icon = PocIcon;
          break;
        case "software_as_service":
          icon = SaasIcon;
          break;
        case "product_project_or_solution":
          icon = ProdIcon;
          break;
        case "feature_or_bug_fix":
          icon = BugIcon;
          break;
      }

      return {
        title: _.get(item, "Label", ""),
        disabled: _.get(item, "Disabled", true),
        questionnaireID: _.get(item, "Questionnaire.0.ID", ""),
        icon: icon
      };
    });

    return {
      title,
      subtitle,
      pillars
    };
  }
}
