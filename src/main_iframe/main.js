import IframesMessages from '../shared/IframeMessages';

class Main extends IframesMessages {
  options = {}

  fieldsValues = {};

  receivedMessageToMethod = {
    SET_OPTIONS: { method: this.setOptions, skipOriginCheck: true },
    FIELD_VALUE: { method: this.receivedFieldValue },
    TOKENIZE: { method: this.tokenize, skipOriginCheck: true },
  };

  setOptions(message) {
    this.options = message.data;
  }

  receivedFieldValue(message) {
    this.fieldsValues[message.data.fieldName] = message.data.value;
  }

  tokenize() {
    if (this.validateFields()) {
      console.log('here we will send data to the backend'); // eslint-disable-line no-console
      console.log(this.fieldsValues); // eslint-disable-line no-console
    } else {
      console.log('not all fields were filled in'); // eslint-disable-line no-console
    }
  }

  receivedValuesForAllFields() {
    return (Object.keys(this.fieldsValues).length === Object.keys(this.options.fields).length);
  }

  validateFields() {
    const fieldsValidationResults = Object.keys(this.options.fields).map((fieldName) => {
      const fieldIsValid = this.fieldsValues[fieldName] != null && this.fieldsValues[fieldName] !== '';
      let message;

      if (fieldIsValid) {
        message = {
          action: 'HIDE_ERROR_MESSAGE',
        };
      } else {
        message = {
          action: 'SHOW_ERROR_MESSAGE',
          data: {
            error: 'Field can not be empty',
          },
        };
      }

      this.sendMessageToIframe(fieldName, message);

      return fieldIsValid;
    });

    return fieldsValidationResults.every((result) => result);
  }

  sendMessageToIframe(fieldName, message) {
    const iframe = window.top.frames[fieldName];
    if (iframe.origin !== this.options.hostOrigin) return;

    iframe.postMessage(message, this.options.hostOrigin);
  }
}

window.Main = Main;
