import IframesCommunication from '../shared/IframesCommunication';
import { inputValidator } from '../shared/inputValidator';

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

interface liveValidationInvalidFields {
  fieldName: string;
  errorMessage: string;
}

const Main = () => {
  let options:Options = { fields: {}, hostOrigin: '' }

  const fieldsValues:FieldValues = {};
  let liveValidationInvalidFields:liveValidationInvalidFields[] = [];

  const setOptions = (message:MessageForOptions) => {
    options = message.data;
  }

  const receivedFieldValue = (message:MessageForFieldValue) => {
    fieldsValues[message.data.fieldName] = message.data.value;
  }

  const liveValidateField = (message:MessageForLiveValidate) => {
    const validationResults = new Array(validateField(message.data.fieldName));
    markInvalidFields(validationResults);
    sendLiveInvalidFieldsToClient(validationResults);
  }

  const tokenize = () => {
    const validationResults = validateFields();
    markInvalidFields(validationResults);

    if (allFieldsAreValid(validationResults)) {
      console.log('here we will send data to the backend'); // eslint-disable-line no-console
      console.log(fieldsValues); // eslint-disable-line no-console
      sendMessageToClient({ action: 'RECEIVED_TOKEN', data: { token: 'here will be the token' } });
    } else {
      sendInvalidFieldsToClient(validationResults);
      console.log('not all fields were filled in'); // eslint-disable-line no-console
    }
  }

  const receivedMessageToMethod = {
    SET_OPTIONS: { method: setOptions, skipOriginCheck: true },
    FIELD_VALUE: { method: receivedFieldValue },
    LIVE_VALIDATE_FIELD: { method: liveValidateField },
    TOKENIZE: { method: tokenize, skipOriginCheck: true },
  };

  const iframesCommunication = IframesCommunication(receivedMessageToMethod);

  const create = () => {
    iframesCommunication.startListeningOnMessages();
  }

  const validateFields = ():ValidationResult[] => {
    const fields = options.fields ?? {};
    return Object.keys(fields).map((fieldName) => validateField(fieldName));
  }

  const validateField = (fieldName:string):ValidationResult => {
    const validationResult = inputValidator(
      options.fields[fieldName].validator,
      fieldName,
      fieldsValues,
    );

    return { fieldName, ...validationResult };
  }

  const allFieldsAreValid = (validationResults:ValidationResult[]):boolean => {
    return validationResults.every((result) => result.valid);
  }

  const sendInvalidFieldsToClient = (validationResults:ValidationResult[]) => {
    const invalidFields = validationResults.filter((result) => !result.valid).map((result) => (
      { fieldName: result.fieldName, errorMessage: result.errorMessage }
    ));

    if (invalidFields.length > 0) {
      sendMessageToClient({ action: 'IVALID_FIELDS', data: { invalidFields } });
    }
  }

  const markInvalidFields = (validationResults:ValidationResult[]) => {
    validationResults.forEach((result) => {
      let message;

      if (result.valid) {
        message = { action: 'MARK_FIELD_AS_VALID' };
      } else {
        message = { action: 'MARK_FIELD_AS_INVALID', data: { error: result.errorMessage } };
      }

      sendMessageToIframe(result.fieldName, message);
    });
  };

  const sendLiveInvalidFieldsToClient = (validationResults:ValidationResult[]) => {
    validationResults.forEach((result) => {
      if (result.valid) {
        liveValidationInvalidFields = liveValidationInvalidFields.filter(invalidField => {
          return invalidField.fieldName !== result.fieldName
        });
      } else {
        liveValidationInvalidFields.push({ fieldName: result.fieldName, errorMessage: result.errorMessage });
      }
    });

    sendMessageToClient({ action: 'LIVE_VALIDATION_RESULTS', data: liveValidationInvalidFields });
  }

  const sendMessageToIframe = (fieldName:string, message:object) => {
    if (!window.top) return;

    const iframe = (window.top.frames as any)[fieldName];
    if (iframe.origin !== options.hostOrigin) return;

    iframe.postMessage(message, options.hostOrigin);
  }

  const sendMessageToClient = (message:object) => {
    if (!window.top) return;

    window.top.postMessage(message, options.hostOrigin);
  }

  return {
    create
  }
}

(window as any).Main = Main;
