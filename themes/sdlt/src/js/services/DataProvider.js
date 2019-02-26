// @flow

import axios from "axios";

export type FormInput = {
  name: string,
  type: "text" | "email" | "textarea"
};

export type FormAction = {
  text: string,
  action: "create_task" | "continue" | "goto" | "message" | "finish",
  target?: string,
  message?: string,
  result?: string
};

export type FormPage = {
  id: string,
  title: string,
  question: string,
  keyInformation?: Array<string>,
  description: string,
  inputs?: Array<FormInput>,
  actions?: Array<FormAction>
};

export type FormSchema = Array<FormPage>;

export default class DataProvider {

  static async provideData(questionnaire: string): FormSchema {
    const instance = axios.create({
      url: `/schema/${questionnaire}.json`,
      method: "get",
    });

    const response = await instance.request();
    return response.data;
  };
}
