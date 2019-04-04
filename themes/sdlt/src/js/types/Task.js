// @flow

import type {Question} from "./Questionnaire";
import type {User} from "./User";

export type TaskSubmissionDisplay = {
  uuid: string,
  taskName: string,
  status: string
};

export type TaskSubmission = {
  id: string,
  uuid: string,
  taskName: string,
  status: string,
  result: string,
  questions: Array<Question>,
  questionnaireSubmissionUUID: string,
  questionnaireSubmissionID: string,
  submitter: User
};
