// @flow

import axios from "axios";
import _ from "lodash";

export default class CSRFTokenService {

  static async getCSRFToken() {

    const response = await axios.request({
      url: "/getCSRFToken",
      method: "get",
      headers: {
        "x-requested-with": "XMLHttpRequest"
      }
    });
    const data = response.data;
    const token = _.get(data, "CSRFToken", null);
    if (!token) {
      throw new Error(data);
    }
    return token;
  }
}
