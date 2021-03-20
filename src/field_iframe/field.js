import IframesMessages from '../shared/IframeMessages';
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
    SHOW_ERROR_MESSAGE: { method: this.showErrorMessage },
    HIDE_ERROR_MESSAGE: { method: this.hideErrorMessage },
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
    return this.getStyle()?.label;
  }

  getFieldLabel() {
    return this.options[this.fieldName()].label;
  }

  optionsForHtmlGenerator() {
    return {
      fieldLabel: this.getFieldLabel(),
      type: this.options[this.fieldName()].type || 'text',
      options: this.options[this.fieldName()].options,
      placeholder: this.options[this.fieldName()].placeholder,
      styles: {
        field: this.getFieldStyle(),
        label: this.getLabelStyle(),
      },
    };
  }

  createField() {
    const html = new InputHtmlGenerator(this.fieldName(), this.optionsForHtmlGenerator());
    const elem = html.output();

    elem.addEventListener('keyup', this.sendFieldValueToMainIframe.bind(this));

    document.body.appendChild(elem);
    this.sendInputSizeToClient();
  }

  sendInputSizeToClient() {
    this.sendMessageToClient({
      action: 'INPUT_SIZE',
      data: {
        fieldName: this.fieldName(),
        width: document.body.scrollWidth,
        height: document.body.scrollHeight,
      },
    });
  }

  setOptions(message) {
    this.options = message.data;

    this.createField();
  }

  sendMessageToClient(message) {
    window.top.postMessage(message, this.options.hostOrigin);
  }

  sendFieldValueToMainIframe() {
    const mainIframe = window.top.frames[Client.mainIframeName];
    if (mainIframe.origin !== this.options.hostOrigin) return;

    const { value } = document.querySelector(`#${this.fieldName()}`);
    const message = {
      action: 'FIELD_VALUE',
      data: {
        fieldName: this.fieldName(),
        value,
      },
    };

    mainIframe.postMessage(message, this.options.hostOrigin);
  }

  hideErrorMessage() {
    const errorElem = document.querySelector('.error-msg');
    if (errorElem.innerHTML.length === 0) return;

    errorElem.style.display = 'none';
    errorElem.innerHTML = '';

    this.sendInputSizeToClient();
  }

  showErrorMessage(message) {
    const errorElem = document.querySelector('.error-msg');

    if (errorElem.innerHTML.length !== 0) return;

    errorElem.innerHTML = message.data.error;
    errorElem.style.display = 'block';

    this.sendInputSizeToClient();
  }
}

window.Field = Field;
