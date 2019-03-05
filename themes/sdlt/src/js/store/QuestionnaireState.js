// @flow

import type {User} from "../types/User";

export type QuestionnaireStartState = {
  title: string,
  subtitle: string,
  keyInformation: string,
  questionnaireID: string,
  user: User | null
};

// TODO: construct real state
export type QuestionnaireSubmissionState = {

};

export type QuestionnaireState = {
  startState: QuestionnaireStartState,
  submissionState: QuestionnaireSubmissionState
};
