// @flow

export default class StringUtil {

  static toString(any: *) {
    if(!any) {
      return "";
    }
    return `${any}`;
  }
}
