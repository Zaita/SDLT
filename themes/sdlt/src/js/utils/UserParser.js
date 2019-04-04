// @flow

import type {User} from "../types/User";
import get from "lodash/get";
import toString from "lodash/toString";

export default class UserParser {

  static parseUserFromJSON(userJSON: string | Object): User {
    const jsonObject = (typeof userJSON === "string" ? JSON.parse(userJSON) : userJSON);

    return {
      id: toString(get(jsonObject, "ID")),
      name: `${get(jsonObject, "FirstName")} ${get(jsonObject, "Surname")}`,
      role: get(jsonObject, "UserRole"),
      email: get(jsonObject, "Email"),
      isSA: toString(get(jsonObject, "IsSA")) === "true",
      isCISO: toString(get(jsonObject, "IsCISO")) === "true",
    }
  }
}
