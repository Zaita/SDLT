// @flow

import type {User} from "../types/User";
import type {Submission} from "../types/Questionnaire";

export type QuestionnaireStartState = {
  title: string,
  subtitle: string,
  keyInformation: string,
  questionnaireID: string,
  user: User | null
};

export type QuestionnaireSubmissionState = {
  title: string,
  siteTitle: string,
  user: User | null,
  submission: Submission | null,
  isCurrentUserApprover: boolean
};

export type QuestionnaireState = {
  startState: QuestionnaireStartState,
  submissionState: QuestionnaireSubmissionState
};
