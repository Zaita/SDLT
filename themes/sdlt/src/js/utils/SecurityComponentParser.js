// @flow

import get from "lodash/get";
import toString from "lodash/toString";
import type {SecurityComponent} from "../types/SecurityComponent";
import toArray from "lodash/toArray";

export default class SecurityComponentParser {

  static parseFromJSONOArray(jsonArray: *): Array<SecurityComponent> {
    return toArray(jsonArray).map((jsonObject) => {
      return SecurityComponentParser.parseFromJSONObject(jsonObject);
    });
  }

  static parseFromJSONObject(jsonObject: *): SecurityComponent {
    return {
      id: toString(get(jsonObject, "ID")),
      name: toString(get(jsonObject, "Name")),
      description: toString(get(jsonObject, "Description")),
      controls: (get(jsonObject, "Controls") || []).map((control) => {
        return {
          id: toString(get(control, "ID")),
          name: toString(get(control, "Name")),
          description: toString(get(control, "Description"))
        }
      })
    }
  }
}
