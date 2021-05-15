import { lunCheck } from './helpers';

interface FieldValues {
  [key:string]: string;
}

interface AvailableValidators {
  [key:string]: Function;
}

interface ErrorMessages {
  [key:string]: string;
}

interface ValidationResult {
  valid: boolean;
  errorMessage: string;
}

export default class InputValidator {
  static AVAILABLE_VALIDATORS: AvailableValidators = {
    notEmpty: InputValidator.notEmpty,
    expirationMonth: InputValidator.expirationMonth,
    expirationYear: InputValidator.expirationYear,
    creditCardNumber: InputValidator.creditCardNumber,
  };

  static ERROR_MESSAGES: ErrorMessages = {
    NOT_EMPTY_ERROR_MESSAGE: 'Field can not be empty',
    EXPIRATION_MONTH_IN_PAST: 'Month can not be in the past',
    EXPIRATION_MONTH_NOT_VALID: 'Month is invalid',
    EXPIRATION_YEAR_IN_PAST: 'Year can not be in the past',
    CREDIT_CARD_NUMBER_NOT_VALID: 'Credit card number is invalid',
  }

  static validate(validator:string, fieldName:string, fieldsValues:FieldValues): ValidationResult {
    const validatorMethod = InputValidator.AVAILABLE_VALIDATORS[validator];

    return validatorMethod.call(this, fieldsValues[fieldName], fieldsValues);
  }

  static notEmpty(fieldValue: string): ValidationResult {
    const valid = fieldValue != null && fieldValue !== '';

    return { valid, errorMessage: InputValidator.ERROR_MESSAGES.NOT_EMPTY_ERROR_MESSAGE };
  }

  static expirationMonth(fieldValue:string, fieldsValues:FieldValues): ValidationResult {
    let { valid, errorMessage } = InputValidator.notEmpty(fieldValue);
    if (!valid) return { valid, errorMessage };

    const expirationMonth = parseInt(fieldValue, 10);

    if (expirationMonth < 1 || expirationMonth > 12) {
      return {
        valid: false,
        errorMessage: InputValidator.ERROR_MESSAGES.EXPIRATION_MONTH_NOT_VALID,
      };
    }

    const expirationYear = parseInt(fieldsValues.expirationYear, 10);
    const expirationDate = new Date();

    expirationDate.setFullYear(expirationYear, expirationMonth, 0);

    valid = Number.isNaN(expirationYear)
            || expirationDate.getFullYear() < new Date().getFullYear()
            || expirationDate > new Date();

    errorMessage = InputValidator.ERROR_MESSAGES.EXPIRATION_MONTH_IN_PAST;

    return { valid, errorMessage };
  }

  static expirationYear(fieldValue:string): ValidationResult {
    let { valid, errorMessage } = InputValidator.notEmpty(fieldValue);
    if (!valid) return { valid, errorMessage };

    const expirationYear = parseInt(fieldValue, 10);

    valid = expirationYear >= new Date().getFullYear();
    errorMessage = InputValidator.ERROR_MESSAGES.EXPIRATION_YEAR_IN_PAST;

    return { valid, errorMessage };
  }

  static creditCardNumber(fieldValue:string): ValidationResult {
    let { valid, errorMessage } = InputValidator.notEmpty(fieldValue);
    if (!valid) return { valid, errorMessage };

    valid = lunCheck(fieldValue.replace(/\D/g, ''));
    errorMessage = InputValidator.ERROR_MESSAGES.CREDIT_CARD_NUMBER_NOT_VALID;

    return { valid, errorMessage };
  }
}
