// @flow

import get from "lodash/get";
import toString from "lodash/toString";
import type {JiraTicket} from "../types/SecurityComponent";
import toArray from "lodash/toArray";

export default class JiraTicketParser {

  static parseFromJSONArray(jsonArray: *): Array<JiraTicket> {
    return toArray(jsonArray).map((jsonObject) => {
      return JiraTicketParser.parseFromJSONObject(jsonObject);
    });
  }

  static parseFromJSONObject(jsonObject: *): JiraTicket {
    return {
      id: toString(get(jsonObject, "ID")),
      jiraKey: toString(get(jsonObject, "JiraKey")),
      link: toString(get(jsonObject, "TicketLink")),
    }
  }
}
