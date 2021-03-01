import { IframesMessages, IframeOrigin } from '../shared/IframeMessages';
import Client from '../client';
import InputHtmlGenerator from '../shared/inputHtmlGenerator';

class Field extends IframesMessages {
  options = {};

  fieldsValues = {};

  receivedMessageToMethod = {
    SET_OPTIONS: {
      method: this.setOptions,
      skipOriginCheck: true,
    },
    SEND_FIELD_VALUE_TO_MAIN_IFRAME: {
      method: this.sendFieldValueToMainIframe,
      skipOriginCheck: true,
    },
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

  optionsForHtmlGenerator() {
    return {
      fieldLabel: this.getFieldLabel(),
      type: 'text',
      styles: {
        field: this.getFieldStyle(),
        label: this.getLabelStyle(),
      }
    };
  }

  createField() {
    const html = new InputHtmlGenerator(this.fieldName(), 'text', this.optionsForHtmlGenerator());
    const elem = html.output();

    document.body.appendChild(elem);
    this.sendInputSizeToClient(elem);
  }

  sendInputSizeToClient(input) {
    this.sendMessageToClient({
      action: 'INPUT_SIZE',
      data: {
        fieldName: this.fieldName(),
        width: input.offsetWidth,
        height: input.offsetHeight,
      },
    });
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

    const { value } = document.querySelector('input');
    const message = {
      action: 'FIELD_VALUE',
      data: {
        fieldName: this.fieldName(),
        value,
      },
    };

    mainIframe.postMessage(message, IframeOrigin);
  }
}

window.Field = Field;
