// @flow

import type {JiraTicket, SecurityComponent} from "../types/SecurityComponent";
import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import get from "lodash/get";
import toString from "lodash/toString";
import compact from "lodash/compact";
import {DEFAULT_NETWORK_ERROR} from "../constants/errors";
import SecurityComponentParser from "../utils/SecurityComponentParser"

export default class SecurityComponentDataService {

  static async loadAvailableComponents(): Promise<Array<SecurityComponent>> {
    const query = `
query {
  readSecurityComponents {
    ID
    Name
    Description
    Controls {
        ID
        Name
        Description
    }
  }
}`;
    const responseJSONObject = await GraphQLRequestHelper.request({query});
    const jsonArray = get(responseJSONObject, "data.readSecurityComponents");
    if (!Array.isArray(jsonArray)) {
      return [];
    }

    const components = jsonArray.map((jsonObject) => {
      return SecurityComponentParser.parseFromJSONObject(jsonObject);
    });

    return components;
  }

  static async createJiraTickets(args: {
    jiraKey: string,
    componentIDList: Array<string>,
    csrfToken: string
  }): Promise<Array<JiraTicket>> {
    const {jiraKey, componentIDList, csrfToken} = {...args};

    const mutations = componentIDList.map((id) => {
      return `
createJiraTicket${id}: createJiraTicket(ComponentID: "${id}", JiraKey: "${jiraKey}") {
  ID
  JiraKey
  TicketLink
}`;
    });

    const query = `
mutation {
  ${mutations.join("\n")}
}`;

    const json = await GraphQLRequestHelper.request({query, csrfToken});
    const updatedData = get(json, "data", null);
    if (!updatedData) {
      throw DEFAULT_NETWORK_ERROR;
    }

    const jiraTickets = compact(componentIDList.map((id) => {
        const key = `createJiraTicket${id}`;
        const json = get(updatedData, key, null);
        if (!json) {
          return null;
        }
        const ticket: JiraTicket = {
          id: toString(get(json, "ID", "")),
          jiraKey: toString(get(json, "JiraKey", "")),
          link: toString(get(json, "TicketLink", ""))
        };
        return ticket;
    }));

    return jiraTickets
  }
}