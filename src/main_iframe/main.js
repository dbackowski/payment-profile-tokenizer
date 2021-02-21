import { IframesMessages } from '../shared/IframeMessages';

class Main extends IframesMessages {
  options = {}
  fieldsValues = {};

  receivedMessageToMethod = {
    'SET_OPTIONS': { method: this.setOptions, skipOriginCheck: true },
    'FIELD_VALUE': { method: this.receivedFieldValue },
  };

  setOptions(message) {
    this.options = message.data;
  }

  sendMessageToClient(message) {
    window.top.postMessage(message, '*');
  }

  receivedFieldValue(message) {
    this.fieldsValues[message.data.fieldName] = message.data.value;

    if (!this.receivedValuesForAllFields()) return;

    if (this.validateFields()) {
      console.log('here we will send data to the backend');
      console.log(this.fieldsValues);
    } else {
      console.log('not all fields were filled in');
    }

    this.fieldsValues = {};
  }

  receivedValuesForAllFields() {
    return (Object.keys(this.fieldsValues).length === Object.keys(this.options.fields).length);
  }

  validateFields() {
    return Object.keys(this.fieldsValues).every(fieldNmae => this.fieldsValues[fieldNmae] !== '');
  }
}

window.Main = Main;
