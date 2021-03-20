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
    if (!this.receivedValuesForAllFields()) return;

    if (this.validateFields()) {
      console.log('here we will send data to the backend'); // eslint-disable-line no-console
      console.log(this.fieldsValues); // eslint-disable-line no-console
    } else {
      console.log('not all fields were filled in'); // eslint-disable-line no-console
    }

    this.fieldsValues = {};
  }

  receivedValuesForAllFields() {
    return (Object.keys(this.fieldsValues).length === Object.keys(this.options.fields).length);
  }

  validateFields() {
    return Object.keys(this.fieldsValues).every((fieldNmae) => this.fieldsValues[fieldNmae] !== '');
  }
}

window.Main = Main;
