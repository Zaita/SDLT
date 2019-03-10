// @flow

export type Task = {
  id: string
};

export type AnswerInput = {
  id: string,
  label: string,
  type: "text" | "email" | "textarea" | "date",
  required: boolean,
  minLength: number,
  placeholder: string,
  data: string | null
}

export type AnswerAction = {
  id: string,
  label: string,
  type: "continue" | "goto" | "message" | "finish",
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
  submissionID: string,
  questions: Array<Question>,
  status: "in_progress" | "waiting_for_approval" | "approved" | "rejected" | "expired"
};