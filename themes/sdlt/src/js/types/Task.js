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
  isCurrentUserAnApprover: boolean
};
