// @flow

export type FormAction = {
  text: string,
  action: "create_task" | "continue" | "goto" | "message" | "finish",
  target?: string,
  message?: string,
  result?: string
};
