// @flow

import type {JiraTicket, SecurityComponent} from "../types/SecurityComponent";

export type ComponentSelectionState = {
  availableComponents: Array<SecurityComponent>,
  selectedComponents: Array<SecurityComponent>,
  jiraTickets: Array<JiraTicket>,
  viewMode: "edit" | "review"
}