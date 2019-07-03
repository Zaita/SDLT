// @flow

import type {SecurityComponent} from "../types/SecurityComponent";

export default class ComponentSelectionUtil {
  static isComponentExists(id: string, collection: Array<SecurityComponent>): boolean {
    return collection.filter((component) => component.id === id).length > 0;
  }
}