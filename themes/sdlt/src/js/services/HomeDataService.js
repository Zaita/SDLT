// @flow

import type {HomeState} from "../store/HomeState";

import PocIcon from "../../img/Home/poc-icon.svg";
import SaasIcon from "../../img/Home/saas-icon.svg";
import ProdIcon from "../../img/Home/prod-icon.svg";
import BugIcon from "../../img/Home/bug-icon.svg";
import RiskIcon from "../../img/Home/risk-icon.svg";

import get from "lodash/get";
import toString from "lodash/toString";
import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import {DEFAULT_NETWORK_ERROR} from "../constants/errors";
import type {Pillar} from "../types/Pillar";
import type {Task} from "../types/Task";
import TaskParser from "../utils/TaskParser";

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
    Tasks {
      ID
      Name
      TaskType
    }
  }
}`;

    // Send request
    const json = await GraphQLRequestHelper.request({query});
    const data = get(json, "data.readDashboard", []);
    if (!Array.isArray(data) || data.length === 0) {
      throw DEFAULT_NETWORK_ERROR;
    }

    // Parse data for use in frontend
    const dashboardJSON = data[0];

    const title = toString(get(dashboardJSON, "Title", ""));
    const subtitle = toString(get(dashboardJSON, "Subtitle", ""));

    const pillarsJSONArray = get(dashboardJSON, "Pillars", []);
    const pillars = this.parsePillars(pillarsJSONArray);

    const taskJSONArray = get(dashboardJSON, "Tasks", []);
    const tasks = this.parseTasks(taskJSONArray);

    return {
      title,
      subtitle,
      pillars,
      tasks,
    };
  }

  static parsePillars(pillarsJSONArray: Array<*>): Array<Pillar> {
    if (!Array.isArray(pillarsJSONArray)) {
      return [];
    }
    const pillars = pillarsJSONArray.map(item => {
      let icon = PocIcon;
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
        case "risk_questionnaire":
          icon = RiskIcon;
          break;
      }

      return {
        title: toString(get(item, "Label", "")),
        disabled: Boolean(get(item, "Disabled", true)),
        questionnaireID: toString(get(item, "Questionnaire.0.ID", "")),
        icon: icon,
      };
    });
    return pillars;
  }

  static parseTasks(tasksJSONArray: Array<*>): Array<Task> {
    if (!Array.isArray(tasksJSONArray)) {
      return [];
    }

    const tasks = [];
    tasksJSONArray.forEach((taskJSON) => {
      const task = TaskParser.parseFromJSONObject(taskJSON);
      tasks.push(task);
    });
    return tasks;
  }
}
