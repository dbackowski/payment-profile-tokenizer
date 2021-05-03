import IframesMessages from '../shared/IframeMessages';
import Client from '../client';
import InputHtmlGenerator from '../shared/inputHtmlGenerator.ts';
import InputFormatter from '../shared/inputFormatter.ts';
import { setStylesOnElement } from '../shared/helpers.ts';

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

  getStyleFor(element) {
    return this.options[this.fieldName()]?.style[element] || {};
  }

  getFieldLabel() {
    return this.options[this.fieldName()].label;
  }

  getInputFormat() {
    return this.options[this.fieldName()].inputFormat;
  }

  optionsForHtmlGenerator() {
    return {
      fieldLabel: this.getFieldLabel(),
      type: this.options[this.fieldName()].type || 'text',
      options: this.options[this.fieldName()].options,
      placeholder: this.options[this.fieldName()].placeholder,
      styles: {
        field: this.getStyleFor('field'),
        label: this.getStyleFor('label'),
      },
    };
  }

  createField() {
    const html = new InputHtmlGenerator(this.fieldName(), this.optionsForHtmlGenerator());
    const elem = html.output();

    if (this.getInputFormat()) {
      elem.addEventListener('input', this.formatInput.bind(this));
    }

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

  formatInput(event) {
    const inputElem = document.querySelector(`#${this.fieldName()}`);
    const { value, carretPosition } = InputFormatter.format(this.getInputFormat(), event.target);
    inputElem.value = value;
    if (carretPosition) event.target.setSelectionRange(carretPosition, carretPosition);
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

  markFieldAsInvalid() {
    const label = document.querySelector('label');
    const input = document.querySelector(`#${this.fieldName()}`);

    if (label) setStylesOnElement(label, this.getStyleFor('labelInvalid'));
    setStylesOnElement(input, this.getStyleFor('fieldInvalid'));
  }

  markFieldAsValid() {
    const label = document.querySelector('label');
    const input = document.querySelector(`#${this.fieldName()}`);

    if (label) setStylesOnElement(label, this.getStyleFor('label'));
    setStylesOnElement(input, this.getStyleFor('field'));
  }

  hideErrorMessage() {
    this.markFieldAsValid();
    const errorElem = document.querySelector('.error-msg');
    if (errorElem.innerHTML.length === 0) return;

    errorElem.style.display = 'none';
    errorElem.innerHTML = '';

    this.sendInputSizeToClient();
  }

  showErrorMessage(message) {
    this.markFieldAsInvalid();
    const errorElem = document.querySelector('.error-msg');
    if (errorElem.innerHTML.length !== 0) return;

    errorElem.innerHTML = message.data.error;
    errorElem.style.display = 'block';

    this.sendInputSizeToClient();
  }
}

window.Field = Field;
