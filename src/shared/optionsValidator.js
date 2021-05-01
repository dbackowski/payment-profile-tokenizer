import fieldsForType from './fieldsForType.ts';

export default class OptionsValidator {
  static validate(options = {}) {
    if (!options.type) return { valid: false, errorMessage: '`type` can not be empty' };
    if (!options.fields) return { valid: false, errorMessage: '`fields` can not be empty' };
    if (!fieldsForType.supportedTypes().includes(options.type)) {
      return {
        valid: false,
        errorMessage: `Type is invalid. It must be one of the following: ${fieldsForType.supportedTypes().join(', ')}`,
      };
    }

    const fields = fieldsForType.fields(options.type);
    const allRequiredFieldsInOptions = Object.keys(fields).every((field) => options.fields[field]);

    if (!allRequiredFieldsInOptions) {
      const missingFields = Object.keys(fields).filter((field) => !options.fields[field]);

      return {
        valid: false,
        errorMessage: `Not all requires fields are present in the \`fields\`, missing: ${missingFields.join(', ')}`,
      };
    }

    return { valid: true };
  }
}
