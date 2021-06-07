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

interface FieldOption {
  style: {
    [key in StyleKeys]: object;
  };
  label: string;
  inputFormat: string;
  type: string;
  placeholder: string;
  liveValidation: boolean;
  options: OptionsForSelect[];
}

interface Options {
  fieldName?: string;
  fieldOptions?: FieldOption;
  hostOrigin?: string;
}

interface OptionsForSelect {
  value:string;
  text:string;
}

interface OptionsForHtmlGenerator {
  fieldLabel: string;
  type: string;
  options?: OptionsForSelect[];
  placeholder: string;
  styles: {
    field: object;
    label: object;
  };
}

interface ShowErrorMessage {
  action: string;
  data: {
    error: string;
  }
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
    return this.options.fieldName;
  }

  // TODO: refactor
  private getStyleFor(element: 'label'|'labelInvalid'|'field'|'fieldInvalid') {
    return this.options.fieldOptions?.style[element] || {};
  }

  private getFieldLabel(): string {
    return this.options.fieldOptions?.label || '';
  }

  private getInputFormat(): string {
    return this.options.fieldOptions?.inputFormat || '';
  }

  private optionsForHtmlGenerator(): OptionsForHtmlGenerator {
    return {
      fieldLabel: this.getFieldLabel(),
      type: this.options.fieldOptions?.type || 'text',
      options: this.options.fieldOptions?.options,
      placeholder: this.options.fieldOptions?.placeholder || '',
      styles: {
        field: this.getStyleFor('field'),
        label: this.getStyleFor('label'),
      },
    };
  }

  private createField() {
    const html = new InputHtmlGenerator(this.options.fieldName || '', this.optionsForHtmlGenerator());
    const elem = html.output();

    if (this.getInputFormat()) {
      elem.addEventListener('input', this.formatInput.bind(this));
    }

    elem.addEventListener('keyup', this.sendFieldValueToMainIframe.bind(this));

    if (this.options.fieldOptions?.liveValidation) {
      const input = elem.querySelector('.input');
      if (input) input.addEventListener('blur', this.liveValidateField.bind(this));
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
    if (!this.options.hostOrigin) return;

    window.top.postMessage(message, this.options.hostOrigin);
  }

  private sendMessageToMainIframe(message: any) {
    const mainIframe = window.top.frames[Client.mainIframeName as any];
    if (mainIframe.origin !== this.options.hostOrigin) return;

    mainIframe.postMessage(message, this.options.hostOrigin);
  }

  private formatInput(event:Event) {
    const inputElem = <HTMLInputElement>document.querySelector(`#${this.fieldName()}`);
    const { value, carretPosition } = InputFormatter.format(this.getInputFormat(), <HTMLInputElement>event.target);
    inputElem.value = value;
    if (carretPosition) (event.target as HTMLInputElement).setSelectionRange(carretPosition, carretPosition);
  }

  private sendFieldValueToMainIframe() {
    const { value } = <HTMLInputElement>document.querySelector(`#${this.fieldName()}`);
    const message = {
      action: 'FIELD_VALUE',
      data: {
        fieldName: this.fieldName(),
        value,
      },
    };

    this.sendMessageToMainIframe(message);
  }

  private liveValidateField(event:Event) {
    const { name } = <HTMLInputElement>event.target;

    if (!name) return;

    const message = {
      action: 'LIVE_VALIDATE_FIELD',
      data: { fieldName: name },
    };

    this.sendMessageToMainIframe(message);
  }

  private markFieldAsInvalid() {
    const label = document.querySelector('label');
    const input = <HTMLInputElement>document.querySelector(`#${this.fieldName()}`);

    if (label) setStylesOnElement(label, this.getStyleFor('labelInvalid'));
    setStylesOnElement(input, this.getStyleFor('fieldInvalid'));
  }

  private markFieldAsValid() {
    const label = document.querySelector('label');
    const input = <HTMLInputElement>document.querySelector(`#${this.fieldName()}`);

    if (label) setStylesOnElement(label, this.getStyleFor('label'));
    setStylesOnElement(input, this.getStyleFor('field'));
  }

  private hideErrorMessage() {
    this.markFieldAsValid();
    const errorElem = <HTMLElement>document.querySelector('.error-msg');
    if (errorElem.innerHTML.length === 0) return;

    errorElem.style.display = 'none';
    errorElem.innerHTML = '';

    this.sendInputSizeToClient();
  }

  private showErrorMessage(message:ShowErrorMessage) {
    this.markFieldAsInvalid();
    const errorElem = <HTMLElement>document.querySelector('.error-msg');
    if (errorElem.innerHTML.length !== 0) return;

    errorElem.innerHTML = message.data.error;
    errorElem.style.display = 'block';

    this.sendInputSizeToClient();
  }
}

(window as any).Field = Field;
