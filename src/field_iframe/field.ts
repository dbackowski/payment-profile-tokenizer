import IframesCommunication from '../shared/IframesCommunication';
import InputHtmlGenerator from '../shared/inputHtmlGenerator';
import InputFormatter from '../shared/inputFormatter';
import { mainIframeName, setStylesOnElement } from '../shared/helpers';

enum StyleKeys {
  label = 'label',
  labelInvalid = 'labelInvalid',
  field = 'field',
  fieldInvalid = 'fieldInvalid',
}

type elementForStyle = 'label'|'labelInvalid'|'field'|'fieldInvalid';
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

const Field = () => {
  let options:Options = { };

  const setOptions = (message: any) => {
    options = message.data;
    createField();
  }

  const sendFieldValueToMainIframe = () => {
    const { value } = <HTMLInputElement>document.querySelector(`#${fieldName()}`);
    const message = {
      action: 'FIELD_VALUE',
      data: {
        fieldName: fieldName(),
        value,
      },
    };

    sendMessageToMainIframe(message);
  }

  const markFieldAsInvalid = () => {
    const label = document.querySelector('label');
    const input = <HTMLInputElement>document.querySelector(`#${fieldName()}`);

    if (label) setStylesOnElement(label, getStyleFor('labelInvalid'));
    setStylesOnElement(input, getStyleFor('fieldInvalid'));
  }

  const markFieldAsValid = () => {
    const label = document.querySelector('label');
    const input = <HTMLInputElement>document.querySelector(`#${fieldName()}`);

    if (label) setStylesOnElement(label, getStyleFor('label'));
    setStylesOnElement(input, getStyleFor('field'));
  }

  const setFocus = () => {
    const input = <HTMLInputElement>document.querySelector(`#${fieldName()}`);
    input.focus();
  }

  const receivedMessageToMethod = {
    SET_OPTIONS: {
      method: setOptions,
      skipOriginCheck: true,
    },
    SEND_FIELD_VALUE_TO_MAIN_IFRAME: {
      method: sendFieldValueToMainIframe,
      skipOriginCheck: true,
    },
    MARK_FIELD_AS_INVALID: { method: markFieldAsInvalid },
    MARK_FIELD_AS_VALID: { method: markFieldAsValid },
    SET_FOCUS: { method: setFocus },
  };

  const iframesCommunication = IframesCommunication(receivedMessageToMethod);

  const create = () => {
    iframesCommunication.startListeningOnMessages();
  }

  const fieldName = () => options.fieldName;

  const getStyleFor = (element: elementForStyle) => {
    return options.fieldOptions?.style?.[element] || {};
  }

  const getFieldLabel = ():string => options.fieldOptions?.label || '';

  const getInputFormat = ():string => options.fieldOptions?.inputFormat || '';

  const optionsForHtmlGenerator = ():OptionsForHtmlGenerator => {
    return {
      fieldLabel: getFieldLabel(),
      type: options.fieldOptions?.type || 'text',
      options: options.fieldOptions?.options,
      placeholder: options.fieldOptions?.placeholder || '',
      styles: {
        field: getStyleFor('field'),
        label: getStyleFor('label'),
      },
    };
  }

  const createField = () => {
    const html = InputHtmlGenerator(options.fieldName || '', optionsForHtmlGenerator());
    const elem = html.output();

    if (getInputFormat()) {
      elem.addEventListener('input', formatInput);
    }

    elem.addEventListener('keyup', sendFieldValueToMainIframe);
    elem.addEventListener('keydown', changeFocusToAnotherField);

    if (options.fieldOptions?.liveValidation) {
      const input = elem.querySelector('.input');
      if (input) input.addEventListener('blur', liveValidateField);
    }

    document.body.appendChild(elem);
    sendInputSizeToClient();
  }

  const changeFocusToAnotherField = (event:KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    event.preventDefault();

    sendMessageToMainIframe({
      action: 'TAB_PRESSED',
      data: {
        fieldName: fieldName(),
      }
    });
  }

  const sendInputSizeToClient = () => {
    sendMessageToClient({
      action: 'INPUT_SIZE',
      data: {
        fieldName: fieldName(),
        width: document.body.scrollWidth,
        height: document.body.scrollHeight,
      },
    });
  }

  const sendMessageToClient = (message: any) => {
    if (!options.hostOrigin || !window.top) return;

    window.top.postMessage(message, options.hostOrigin);
  }

  const sendMessageToMainIframe = (message: any) => {
    if (!window.top) return;

    const mainIframe = window.top.frames[mainIframeName as any];
    if (mainIframe.origin !== options.hostOrigin) return;

    mainIframe.postMessage(message, options.hostOrigin);
  }

  const formatInput = (event:Event) => {
    const inputElem = <HTMLInputElement>document.querySelector(`#${fieldName()}`);
    const { value, carretPosition } = InputFormatter(getInputFormat(), <HTMLInputElement>event.target);
    inputElem.value = value;
    if (carretPosition) (event.target as HTMLInputElement).setSelectionRange(carretPosition, carretPosition);
  }

  const liveValidateField = (event:Event) => {
    const { name } = <HTMLInputElement>event.target;

    if (!name) return;

    const message = {
      action: 'LIVE_VALIDATE_FIELD',
      data: { fieldName: name },
    };

    sendMessageToMainIframe(message);
  }

  return {
    create
  };
}

(window as any).Field = Field;
