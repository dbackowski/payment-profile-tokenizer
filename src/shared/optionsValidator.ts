import { fieldsForType, supportedTypes } from './fieldsForType';

interface ValidateResult {
  valid: boolean;
  errorMessage?: string;
}

interface Field {
  tabOrder: number;
}

interface Options {
  type: string;
  fields: {
    [key:string]: Field;
  }
}

const tabOrderValidator = (options: Options): ValidateResult => {
  if (!Object.entries(options.fields).find(([_key, value]) => value.tabOrder)) return { valid: true };

  const notANumberTabOrderField = Object.entries(options.fields).find(([_key, value]) => {
    return (typeof value.tabOrder !== 'number');
  });

  if (notANumberTabOrderField) {
    return {
      valid: false,
      errorMessage: `Fieldname: ${notANumberTabOrderField[0]}, tabOrder value: '${notANumberTabOrderField[1].tabOrder}' is not a number`,
    };
  }

  return { valid: true };
};

export const optionsValidator = (options:Options): ValidateResult => {
  if (!options.type) return { valid: false, errorMessage: '`type` can not be empty' };
  if (!options.fields) return { valid: false, errorMessage: '`fields` can not be empty' };
  if (!supportedTypes.includes(options.type)) {
    return {
      valid: false,
      errorMessage: `Type is invalid. It must be one of the following: ${supportedTypes.join(', ')}`,
    };
  }

  const fields = fieldsForType(options.type);
  const allRequiredFieldsInOptions = Object.keys(fields).every((field) => options.fields[field]);

  if (!allRequiredFieldsInOptions) {
    const missingFields = Object.keys(fields).filter((field) => !options.fields[field]);

    return {
      valid: false,
      errorMessage: `Not all requires fields are present in the \`fields\`, missing: ${missingFields.join(', ')}`,
    };
  }

  const tabOrderValidationResult = tabOrderValidator(options);

  if (!tabOrderValidationResult.valid) {
    return tabOrderValidationResult;
  }

  return { valid: true };
}
