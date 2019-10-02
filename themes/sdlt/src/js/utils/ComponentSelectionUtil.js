// @flow

import type {SecurityComponent} from "../types/SecurityComponent";

export default class ComponentSelectionUtil {
  static isComponentExist(id: string, collection: Array<SecurityComponent>): boolean {
    return collection.filter((component) => component.id === id).length > 0;
  }

  static isSelectedComponentExist (id: string, productAspect: string, collection: Array<SecurityComponent>): boolean {
      if (productAspect !== "") {
        return collection.filter((component) => component.id === id && component.productAspect === productAspect).length > 0;
      }
      return collection.filter((component) => component.id === id).length > 0;
  }

  static isComponentSaved(id: string, productAspect: string, collection: Array<SecurityComponent>): boolean {
    return collection.filter((component) => component.id === id && component.productAspect === productAspect && component.isSaved).length > 0;
  }

  static doescomponentExistForProductAspect (productAspect: string, collection: Array<SecurityComponent>): boolean {
    return collection.filter((component) => component.productAspect === productAspect).length > 0;

  }
}
