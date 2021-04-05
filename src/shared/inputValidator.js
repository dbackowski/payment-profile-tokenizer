export default class InputValidator {
  static AVAILABLE_VALIDATORS = {
    NOT_EMPTY: InputValidator.notEmpty,
  };

  static NOT_EMPTY_ERROR_MESSAGE = 'Field can not be empty';

  static validate(validator, fieldName, fieldsValues) {
    const validatorMethod = InputValidator.AVAILABLE_VALIDATORS[validator];

    return validatorMethod.call(this, fieldsValues[fieldName]);
  }

  static notEmpty(value, errorMessage = InputValidator.NOT_EMPTY_ERROR_MESSAGE) {
    const valid = value != null && value !== '';

    return { valid, errorMessage };
  }
}
