// @flow

import compress from "graphql-query-compress";
import axios from "axios";
import _ from "lodash";

export default class GraphQLRequestHelper {

  static async request(query: string, variables?: Object): Promise<Object> {
    const headers = {};

    /* Uncomment following lines to add custom headers for auth and/or statics
    const user = StorageService.readUser();
    if (user && user.Token) {
      headers["Authorization"] = "Bearer " + user.Token;
    }
    */

    const data = {
      query: compress(query),
      variables: variables,
    };

    const inst = axios.create({
      url: "/graphql",
      method: "post",
      data: data,
      headers: headers,
    });

    const response = await inst.request();
    const json = response.data;

    // Deal with common error
    const errorMessage = _.get(json, "errors.0.message", null);
    if (errorMessage) {
      // Check auth error
      if (errorMessage === "Please log in first...") {
        window.location.href = "/Security/login?BackURL=%2F";
      }

      throw new Error(errorMessage);
    }

    return json;
  }
}
