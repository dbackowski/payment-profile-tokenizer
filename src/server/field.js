import { IframesMessages } from '../helpers/IframeMessages';

class Field extends IframesMessages {
  options = {};
  fieldsValues = {};

  receivedMessageToMethod = {
    'SET_OPTIONS': { method: this.setOptions, skipOriginCheck: true },
    'SEND_DATA_TO_MAIN_IFRAME': { method: this.sendDataToMainIframe },
  };

  createField() {
    const input = document.createElement('input');
    input.name = this.options.fieldName;
    document.body.appendChild(input);

    this.sendMessageToClient({
      action: "INPUT_SIZE",
      data: {
        fieldName: this.options.fieldName,
        width:input.clientWidth,
        height: input.clientHeight,
      }
    })
  }

  setOptions(message) {
    this.options = message.data;

    this.createField();
  }

  sendMessageToClient(message) {
    window.top.postMessage(message, '*');
  }

  sendDataToMainIframe() {
    const mainIframe = window.top.frames['mainIframe'];

    // add check for mainFrame origin here

    const value = document.querySelector('input').value;
    const message = {
      action: 'FIELD_VALUE',
      data: {
        fieldName: this.options.fieldName,
        value: value
      },
    };

    mainIframe.postMessage(message, '*');
  }
}

window.Field = Field;
