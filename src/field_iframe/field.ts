import IframesMessages from '../shared/IframeMessages';
import Client from '../client';
import InputHtmlGenerator from '../shared/inputHtmlGenerator';
import InputFormatter from '../shared/inputFormatter';
import { setStylesOnElement } from '../shared/helpers';

enum StyleKeys {
  label = 'label',
  labelInvalid = 'labelInvalid',
  field = 'field',
  fieldInvalid = 'fieldInvalid',
}

interface Field {
  style: {
    [key in StyleKeys]: object;
  };
  label: string;
  inputFormat: string;
  type: string;
  placeholder: string;
}

interface Options {
  [key:string]: Field;
  //hostOrigin: string;
}

interface OptionsForHtmlGenerator {
  fieldLabel: string;
  type: string;
  options: Options;
  placeholder: string;
  styles: {
    field: object;
    label: object;
  };
}

class Field extends IframesMessages {
  private options:Options = { };

  protected receivedMessageToMethod = {
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

  private fieldName() {
    return Object.keys(this.options)[0];
  }

  // TODO: refactor
  private getStyleFor(element: 'label'|'labelInvalid'|'field'|'fieldInvalid') {
    this.options[this.fieldName()]?.style.label;
    return this.options[this.fieldName()]?.style[element] || {};
  }

  private getFieldLabel(): string {
    return this.options[this.fieldName()].label;
  }

  private getInputFormat(): string {
    return this.options[this.fieldName()].inputFormat;
  }

  private optionsForHtmlGenerator(): OptionsForHtmlGenerator {
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

  private createField() {
    const html = new InputHtmlGenerator(this.fieldName(), this.optionsForHtmlGenerator());
    const elem = html.output();

    if (this.getInputFormat()) {
      elem.addEventListener('input', this.formatInput.bind(this));
    }

    elem.addEventListener('keyup', this.sendFieldValueToMainIframe.bind(this));

    if (this.options[this.fieldName()].liveValidation) {
      elem.querySelector('.input').addEventListener('blur', this.liveValidateField.bind(this));
    }

    document.body.appendChild(elem);
    this.sendInputSizeToClient();
  }

  private sendInputSizeToClient() {
    this.sendMessageToClient({
      action: 'INPUT_SIZE',
      data: {
        fieldName: this.fieldName(),
        width: document.body.scrollWidth,
        height: document.body.scrollHeight,
      },
    });
  }

  private setOptions(message: any) {
    this.options = message.data;

    this.createField();
  }

  private sendMessageToClient(message: any) {
    window.top.postMessage(message, this.options.hostOrigin);
  }

  private sendMessageToMainIframe(message: any) {
    const mainIframe = window.top.frames[Client.mainIframeName];
    if (mainIframe.origin !== this.options.hostOrigin) return;

    mainIframe.postMessage(message, this.options.hostOrigin);
  }

  private formatInput(event) {
    const inputElem = document.querySelector(`#${this.fieldName()}`);
    const { value, carretPosition } = InputFormatter.format(this.getInputFormat(), event.target);
    inputElem.value = value;
    if (carretPosition) event.target.setSelectionRange(carretPosition, carretPosition);
  }

  private sendFieldValueToMainIframe() {
    const { value } = document.querySelector(`#${this.fieldName()}`);
    const message = {
      action: 'FIELD_VALUE',
      data: {
        fieldName: this.fieldName(),
        value,
      },
    };

    this.sendMessageToMainIframe(message);
  }

  private liveValidateField(event) {
    const { name } = event.target;

    if (!name) return;

    const message = {
      action: 'LIVE_VALIDATE_FIELD',
      data: { fieldName: name },
    };

    this.sendMessageToMainIframe(message);
  }

  private markFieldAsInvalid() {
    const label = document.querySelector('label');
    const input = document.querySelector(`#${this.fieldName()}`);

    if (label) setStylesOnElement(label, this.getStyleFor('labelInvalid'));
    setStylesOnElement(input, this.getStyleFor('fieldInvalid'));
  }

  private markFieldAsValid() {
    const label = document.querySelector('label');
    const input = document.querySelector(`#${this.fieldName()}`);

    if (label) setStylesOnElement(label, this.getStyleFor('label'));
    setStylesOnElement(input, this.getStyleFor('field'));
  }

  private hideErrorMessage() {
    this.markFieldAsValid();
    const errorElem = document.querySelector('.error-msg');
    if (errorElem.innerHTML.length === 0) return;

    errorElem.style.display = 'none';
    errorElem.innerHTML = '';

    this.sendInputSizeToClient();
  }

  private showErrorMessage(message) {
    this.markFieldAsInvalid();
    const errorElem = document.querySelector('.error-msg');
    if (errorElem.innerHTML.length !== 0) return;

    errorElem.innerHTML = message.data.error;
    errorElem.style.display = 'block';

    this.sendInputSizeToClient();
  }
}

(window as any).Field = Field;
