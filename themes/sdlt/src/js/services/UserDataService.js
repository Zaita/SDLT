// @flow

import type {User} from "../types/User";
import GraphQLRequestHelper from "../utils/GraphQLRequestHelper";
import _ from "lodash";
import UserParser from "../utils/UserParser";

export default class UserDataService {

  static async fetchCurrentUser(): Promise<User> {
    const query = `
query {
  readCurrentMember {
    ID
    Email
    FirstName
    Surname
    IsSA
    IsCISO
  }
}`;
    const responseJSONObject = await GraphQLRequestHelper.request({query});

    const currentMemberJSONObject = _.get(responseJSONObject, "data.readCurrentMember.0", null);
    if (!currentMemberJSONObject) {
      throw new Error("Authenticate error");
    }

    const user = UserParser.parseUserFromJSON(currentMemberJSONObject);
    if (!user.id) {
      throw new Error("Authenticate error");
    }

    return user;
  }
}
