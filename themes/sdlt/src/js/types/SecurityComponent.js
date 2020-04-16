// @flow

export type SecurityComponent = {
  id: string,
  name: string,
  description: string,
  implementationGuidance: string,
  implementationEvidence: string
}

export type JiraTicket = {
  id: string,
  jiraKey: string,
  link: string
};
