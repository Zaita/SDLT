// @flow

import axios from "axios";
import type {FormSchema} from "../types/FormSchema";

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
