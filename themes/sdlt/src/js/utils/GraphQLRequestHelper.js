// @flow

import compress from "graphql-query-compress";
import axios from "axios";
import _ from "lodash";
import URLUtil from "./URLUtil";

export type GraphQLRequestArgument = {
  query: string,
  variables?: Object,
  csrfToken?: string
};

export default class GraphQLRequestHelper {

  static async request(argument: GraphQLRequestArgument): Promise<Object> {
    const {query, variables, csrfToken} = {...argument};
    const headers = {};

    if (csrfToken) {
      headers["X-CSRF-TOKEN"] = csrfToken;
    }

    const data = {
      query: compress(query),
      variables: variables,
    };

    const response = await axios.request({
      url: "/graphql",
      method: "post",
      data: data,
      headers: headers,
    });
    const json = response.data;

    // Deal with common error
    const errorMessage = _.get(json, "errors.0.message", null);
    if (errorMessage) {
      throw new Error(errorMessage);
    }

    return json;
  }
}
