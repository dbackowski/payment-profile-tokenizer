import { IframesMessages, IframeOrigin } from '../helpers/IframeMessages';
import { Client } from '../client';
class Field extends IframesMessages {
  options = {};
  fieldsValues = {};

  receivedMessageToMethod = {
    'SET_OPTIONS': { method: this.setOptions, skipOriginCheck: true },
    'SEND_FIELD_VALUE_TO_MAIN_IFRAME': { method: this.sendFieldValueToMainIframe, skipOriginCheck: true },
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

  sendFieldValueToMainIframe() {
    const mainIframe = window.top.frames[Client.mainIframeName];
    if (mainIframe.origin !== IframeOrigin) return;

    const value = document.querySelector('input').value;
    const message = {
      action: 'FIELD_VALUE',
      data: {
        fieldName: this.options.fieldName,
        value: value
      },
    };

    mainIframe.postMessage(message, IframeOrigin);
  }
}

window.Field = Field;
