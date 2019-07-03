// @flow

export default class ErrorUtil {

  static displayError(error: Error, rethrow: boolean = true) {
    alert(error);
    if (rethrow) {
      throw error;
    }
  }
}
