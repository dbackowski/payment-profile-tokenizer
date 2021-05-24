import IframesMessages from '../shared/IframeMessages';
import InputValidator from '../shared/inputValidator';

interface FieldValues {
  [key:string]: string;
}

interface FieldValueData {
  fieldName: string;
  value: string;
}

interface MessageForFieldValue {
  action: string;
  data: FieldValueData;
}

interface MessageForOptions {
  action: string;
  data: Options;
}

interface MessageForLiveValidate {
  action: string;
  data: {
    fieldName: string;
  }
}

interface Field {
  validator: string;
}

interface Options {
  fields: {
    [key:string]: Field
  };
  hostOrigin: string;
}

interface ValidationResult {
  fieldName: string;
  valid: boolean;
  errorMessage: string;
}

class Main extends IframesMessages {
  options:Options = { fields: {}, hostOrigin: '' }

  fieldsValues:FieldValues = {};

  receivedMessageToMethod = {
    SET_OPTIONS: { method: this.setOptions, skipOriginCheck: true },
    FIELD_VALUE: { method: this.receivedFieldValue },
    LIVE_VALIDATE_FIELD: { method: this.liveValidateField },
    TOKENIZE: { method: this.tokenize, skipOriginCheck: true },
  };

  setOptions(message:MessageForOptions) {
    this.options = message.data;
  }

  receivedFieldValue(message:MessageForFieldValue) {
    this.fieldsValues[message.data.fieldName] = message.data.value;
  }

  tokenize() {
    const validationResults = this.validateFields();
    this.showErrorMessageForInvalidFields(validationResults);

    if (Main.allFieldsAreValid(validationResults)) {
      console.log('here we will send data to the backend'); // eslint-disable-line no-console
      console.log(this.fieldsValues); // eslint-disable-line no-console
      this.sendMessageToClient({ action: 'RECEIVED_TOKEN', message: 'here will be the token' });
    } else {
      this.sendInvalidFieldsToClient(validationResults);
      console.log('not all fields were filled in'); // eslint-disable-line no-console
    }
  }

  validateFields():ValidationResult[] {
    const fields = this.options.fields ?? {};
    return Object.keys(fields).map((fieldName) => this.validateField(fieldName));
  }

  validateField(fieldName:string) {
    const validationResult = InputValidator.validate(
      this.options.fields[fieldName].validator,
      fieldName,
      this.fieldsValues,
    );

    return { fieldName, ...validationResult };
  }

  static allFieldsAreValid(validationResults:ValidationResult[]) {
    return validationResults.every((result) => result.valid);
  }

  liveValidateField(message:MessageForLiveValidate) {
    const validationResults = new Array(this.validateField(message.data.fieldName));
    this.showErrorMessageForInvalidFields(validationResults);
  }

  sendInvalidFieldsToClient(validationResults:ValidationResult[]) {
    const invalidFields = validationResults.filter((result) => !result.valid).map((result) => (
      { fieldName: result.fieldName, errorMessage: result.errorMessage }
    ));

    if (invalidFields.length > 0) {
      this.sendMessageToClient({ action: 'IVALID_FIELDS', invalidFields });
    }
  }

  showErrorMessageForInvalidFields(validationResults:ValidationResult[]) {
    validationResults.forEach((result) => {
      let message;

      if (result.valid) {
        message = { action: 'HIDE_ERROR_MESSAGE' };
      } else {
        message = { action: 'SHOW_ERROR_MESSAGE', data: { error: result.errorMessage } };
      }

      this.sendMessageToIframe(result.fieldName, message);
    });
  }

  sendMessageToIframe(fieldName:string, message:object) {
    const iframe = (window.top.frames as any)[fieldName];
    if (iframe.origin !== this.options.hostOrigin) return;

    iframe.postMessage(message, this.options.hostOrigin);
  }

  sendMessageToClient(message:object) {
    window.top.postMessage(message, this.options.hostOrigin);
  }
}

(window as any).Main = Main;
