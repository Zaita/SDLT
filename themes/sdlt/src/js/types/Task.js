// @flow

import type {Question} from "./Questionnaire";
import type {User} from "./User";
import type {JiraTicket, SecurityComponent} from "./SecurityComponent";

export type Task = {
  id: string,
  name: string,
  type: "questionnaire" | "selection",
  questions: Array<Question>
};

export type TaskSubmissionDisplay = {
  uuid: string,
  taskName: string,
  taskType: "questionnaire" | "selection",
  status: string
};

export type TaskSubmission = {
  id: string,
  uuid: string,
  taskName: string,
  taskType: "questionnaire" | "selection",
  status: string,
  result: string,
  questions: Array<Question>,
  selectedComponents: Array<SecurityComponent>,
  jiraTickets: Array<JiraTicket>,
  questionnaireSubmissionUUID: string,
  questionnaireSubmissionID: string,
  questionnaireSubmissionStatus: string,
  submitter: User,
  approver: User,
  lockWhenComplete: boolean,
  isTaskApprovalRequired: boolean,
  isCurrentUserAnApprover: boolean,
  productAspects: Array<ProductAspect>,
};

export type SecurityRiskAssessment = {
  id: string,
  uuid: string,
  questionnaireSubmissionUUID: string,
  likelihoodThresholds: Array<LikelihoodThreshold>,
};

export type LikelihoodThreshold = {
  value: number,
  operator: string,
  colour: string,
  name:string
}

export type ProductAspect = {
  id: string,
  uuid: value
};

export type RiskRatingThreshold = {
  riskRating: string
  colour: string,
  likelihood: string,
  impact: string
}

export type TaskSubmissionListItem = {
  id: string,
  uuid: string,
  taskName: string,
  created: string,
  status: string,
  submitterName: string
};
