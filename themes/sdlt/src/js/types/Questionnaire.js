// @flow

// Questionnaire Schema

import type {User} from "./User";

export type Task = {
  id: string
};

export type AnswerInput = {
  id: string,
  label: string,
  type: string, //"text" | "email" | "textarea" | "date",
  required: boolean,
  minLength: number,
  placeholder: string,
  data: string | null
}

export type AnswerAction = {
  id: string,
  label: string,
  type: string, //"continue" | "goto" | "message" | "finish",
  isChose: boolean,
  message?: string,
  task?: Task,
  goto?: string
}

export type Question = {
  id: string,
  title: string,
  heading: string,
  description: string,
  type: "input" | "action",
  inputs?: Array<AnswerInput>,
  actions?: Array<AnswerAction>,
  isCurrent: boolean,
  hasAnswer: boolean,
  isApplicable: boolean
};

export type Submission = {
  questionnaireID: string,
  questionnaireTitle: string,
  submissionID: string,
  submissionUUID: string,
  submitter: User,
  questions: Array<Question>,
  status: string, //"in_progress" | "waiting_for_approval" | "approved" | "rejected" | "expired"
  approvalStatus: {
    chiefInformationSecurityOfficer: string,
    businessOwner: string,
    securityArchitect: string
  }
};

// Submission Data

export type SubmissionInputData = {
  id: string,
  data: string | null
}

export type SubmissionActionData = {
  id: string,
  isChose: boolean
};

export type SubmissionQuestionData = {
  isCurrent: boolean,
  hasAnswer: boolean,
  isApplicable: boolean,
  answerType: "input" | "action",
  inputs?: Array<SubmissionInputData>,
  actions?: Array<SubmissionActionData>
};
