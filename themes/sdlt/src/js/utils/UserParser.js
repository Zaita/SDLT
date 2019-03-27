// @flow

import type {User} from "../types/User";
import _ from "lodash";

export default class UserParser {

  static parseUserFromJSON(userJSON: string | Object): User {
    const jsonObject = (typeof userJSON === "string" ? JSON.parse(userJSON) : userJSON);

    return {
      id: _.toString(_.get(jsonObject, "ID")),
      name: `${_.get(jsonObject, "FirstName")} ${_.get(jsonObject, "Surname")}`,
      role: _.get(jsonObject, "UserRole"),
      email: _.get(jsonObject, "Email"),
    }
  }
}
