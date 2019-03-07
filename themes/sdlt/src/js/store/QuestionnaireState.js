// @flow

import type {User} from "../types/User";
import type {FormSchema} from "../types/FormSchema";
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
  subtitle: string,
  user: User | null,
  submission: Submission | null
};

export type QuestionnaireState = {
  startState: QuestionnaireStartState,
  submissionState: QuestionnaireSubmissionState
};
