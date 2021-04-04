export default class InputValidator {
  static NOT_EMPTY_ERROR_MESSAGE = 'Field can not be empty';

  static notEmpty(value, errorMessage = InputValidator.NOT_EMPTY_ERROR_MESSAGE) {
    const valid = value != null && value !== '';

    return { valid, errorMessage };
  }
}
