// @flow

import compress from "graphql-query-compress";
import axios, {AxiosInstance} from "axios";

export default class GraphQLRequestHelper {

  static prepareRequest(query: string, variables?: Object): AxiosInstance {
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

    return axios.create({
      url: "/graphql",
      method: "post",
      data: data,
      headers: headers,
    });
  }
}
