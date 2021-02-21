import { IframesMessages, IframeOrigin } from '../shared/IframeMessages';
import { Client } from '../client';
import { setStylesOnElement } from '../shared/helpers';

class Field extends IframesMessages {
  options = {};
  fieldsValues = {};

  receivedMessageToMethod = {
    'SET_OPTIONS': { method: this.setOptions, skipOriginCheck: true },
    'SEND_FIELD_VALUE_TO_MAIN_IFRAME': { method: this.sendFieldValueToMainIframe, skipOriginCheck: true },
  };

  fieldName() {
    return Object.keys(this.options)[0];
  }

  createField() {
    const input = document.createElement('input');
    input.name = this.fieldName();
    setStylesOnElement(input, this.options[this.fieldName()].style);
    document.body.appendChild(input);

    this.sendMessageToClient({
      action: "INPUT_SIZE",
      data: {
        fieldName: this.fieldName(),
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
        fieldName: this.fieldName(),
        value: value
      },
    };

    mainIframe.postMessage(message, IframeOrigin);
  }
}

window.Field = Field;
