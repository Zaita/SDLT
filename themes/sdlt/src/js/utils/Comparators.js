// @flow

/**
 * Utility class for comparing two numbers based on an operator
 */
export default class Comparators {
  /**
   * Comparator for "greater than > " operator
   * @param {*} leftoperand number
   * @param {*} rightoperand number
   * @return boolean
   */
  static gt(leftoperand, rightoperand) {
    return leftoperand > rightoperand;
  }

  /**
   * Comparator for "greater than or equal to >= " operator
   * @param {*} leftoperand number
   * @param {*} rightoperand number
   * @return boolean
   */
  static gte(leftoperand, rightoperand) {
    return leftoperand >= rightoperand;
  }

  /**
   * Comparator for "less than < " operator
   * @param {*} leftoperand number
   * @param {*} rightoperand number
   * @return boolean
   */
  static lt(leftoperand, rightoperand) {
    return leftoperand < rightoperand;
  }

  /**
   * Comparator for "less than or equal to <= " operator
   * @param {*} leftoperand number
   * @param {*} rightoperand number
   * @return boolean
   */
  static lte(leftoperand, rightoperand) {
    return leftoperand <= rightoperand;
  }
}
