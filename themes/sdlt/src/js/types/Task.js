// @flow

import type {Question} from "./Questionnaire";

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
  questionnaireSubmissionUUID: string
};
