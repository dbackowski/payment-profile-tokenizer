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

  getStyle() {
    return this.options[this.fieldName()]?.style;
  }

  getFieldStyle() {
    return this.getStyle()?.field;
  }

  getLabelStyle() {
    return this.getStyle()?.label
  }

  getFieldLabel() {
    return this.options[this.fieldName()].label;
  }

  createField() {
    const span = document.createElement('span');
    const label = document.createElement('label');
    const input = document.createElement('input');

    input.name = this.fieldName();
    input.className = 'input';
    setStylesOnElement(input, this.getFieldStyle());

    label.setAttribute('for', input.name);
    label.innerText = this.getFieldLabel();
    setStylesOnElement(label, this.getLabelStyle());

    span.appendChild(label)
    span.appendChild(input);

    document.body.appendChild(span);

    this.sendInputSizeToClient(span);
  }

  sendInputSizeToClient(input) {
    this.sendMessageToClient({
      action: "INPUT_SIZE",
      data: {
        fieldName: this.fieldName(),
        width: input.offsetWidth,
        height: input.offsetHeight,
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
