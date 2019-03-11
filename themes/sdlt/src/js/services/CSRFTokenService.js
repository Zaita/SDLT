// @flow

import axios from "axios";
import _ from "lodash";

export default class CSRFTokenService {

  static async getCSRFToken() {
    const inst = axios.create({
      url: "/getCSRFToken",
      method: "get",
      headers: {
        "x-requested-with": "XMLHttpRequest"
      }
    });
    const response = await inst.request();
    const data = response.data;
    const token = _.get(data, "CSRFToken", null);
    if (!token) {
      throw new Error(data);
    }
    return token;
  }
}
