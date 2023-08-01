import IframesCommunication from './shared/IframesCommunication';
import {
  generateMainIframeName,
  allowedIframeOrigins,
  createIframe,
  getHostOrigin,
  mergeOptionsWithOptionsForType,
} from './shared/helpers';
import { optionsValidator } from './shared/optionsValidator';
import { setStylesOnElement } from './shared/styleElement';

type Iframes = {
  [key:string]: HTMLIFrameElement;
}

type Field = {
  selector: string;
  label: string;
  placeholder: string;
  liveValidation: boolean;
  style: object;
  tabOrder?: number;
}

type Options = {
  type: string;
  liveValidation?: boolean;
  fields: {
    [key:string]: Field;
  },
  onLiveValidation?:Function;
}

type OnLoadCallback = {
  (iframe: HTMLIFrameElement): void;
}

type OptionsForIframe = {
  fieldName:string;
  elementToAppendIframeTo: HTMLElement|null;
  src:string;
  onLoadCallback:OnLoadCallback;
  styles:object;
}

type SendMessageToIframe = {
  action:string;
  data?:object;
}

type SetIframeSize = {
  action:string;
  data: {
    fieldName:string;
    width:string;
    height:string;
  }
}

type InvalidFields = {
  action:string;
  data: {
    invalidFields:string[];
  }
}

type ReceivedToken = {
  action:string;
  data: {
    token:string;
  }
}

type TokenError = {
  action:string;
  data: {
    error:string;
  }
}

type receivedLiveValidationErrors = {
  action:string;
  data: []
}

const PaymentProfileTokenizer = () => {
  let options:Options = { type: '', fields: {} };

  const iframes:Iframes = {};

  let tokenizeOnSuccess:Function = () => {};

  let tokenizeOnError:Function = () => {};

  let onLiveValidation:Function = () => {};

  let mainIframeName:string;

  const setIframeSize = (message:SetIframeSize) => {
    const iframe = iframes[message.data.fieldName];

    const styles = {
      width: message.data.width,
      height: message.data.height,
    };

    setStylesOnElement(iframe, styles);
  }

  const invalidFields = (message:InvalidFields) => {
    tokenizeOnError({ error: 'Some fields are not valid', invalidFields: message.data.invalidFields });
  }

  const receivedToken = (message:ReceivedToken) => {
    tokenizeOnSuccess(message.data.token);
  }

  const receivedLiveValidationErrors = (message:receivedLiveValidationErrors) => {
    onLiveValidation(message.data);
  };

  const tokenError = (message:TokenError) => {
    tokenizeOnError({ error: message.data.error });
  };

  const receivedMessageToMethod = {
    INPUT_SIZE: { method: setIframeSize },
    IVALID_FIELDS: { method: invalidFields },
    TOKEN_ERROR: { method: tokenError },
    RECEIVED_TOKEN: { method: receivedToken },
    LIVE_VALIDATION_RESULTS: { method: receivedLiveValidationErrors },
  };

  const iframesCommunication = IframesCommunication(receivedMessageToMethod);

  let originForIframes:string|null;

  const remove = () => {
    iframesCommunication.stopListeningOnMessages();

    Object.entries(iframes).forEach(([fieldName, iframe]) => {
      iframe.remove();
      delete iframes[fieldName];
    });
  }

  const create = async (opt:Options) => {
    iframesCommunication.startListeningOnMessages();

    if (Object.keys(iframes).length > 0) {
      remove();
      iframesCommunication.startListeningOnMessages();
    }

    options = opt;
    originForIframes = getOriginForIframes();
    mainIframeName = generateMainIframeName();

    if (!originForIframes) return;

    await createMainIframe();

    const {
      valid: optionsValid,
      errorMessage: optionsInvalidErrorMessage,
    } = optionsValidator(options);

    if (optionsValid) {
      mergeOptionsWithOptionsForType(options);
      if (options.onLiveValidation) onLiveValidation = options.onLiveValidation;
      sendMessageToMainIframe({ action: 'SET_OPTIONS', data: dataForIframe(mainIframeName) });
      await createFields();
    } else {
      console.error(optionsInvalidErrorMessage); // eslint-disable-line no-console
    }
  };

  const tokenize = () => {
    sendMessageToMainIframe({ action: 'TOKENIZE' });

    return new Promise((resolve, reject) => {
      tokenizeOnSuccess = resolve;
      tokenizeOnError = reject;
    });
  }

  const getOriginForIframes = ():string => {
    const scriptElemForClient = Array.from(document.querySelectorAll('script')).find((script) => {
      if (!script.src) return null;

      return allowedIframeOrigins.find((origin) => script.src.startsWith(origin));
    });

    if (!scriptElemForClient) return '';

    return new URL(scriptElemForClient.src).origin;
  }

  const fieldNameIsMainIframe = (fieldName:string):boolean => {
    return fieldName === mainIframeName;
  }

  const elementToAppendIframeTo = (fieldName:string): HTMLElement|null => {
    return fieldNameIsMainIframe(fieldName)
      ? document.body
      : document.querySelector(options.fields[fieldName].selector);
  };

  const srcForIframe = (fieldName:string) => {
    return fieldNameIsMainIframe(fieldName)
      ? `${originForIframes}/dist/main.html`
      : `${originForIframes}/dist/field.html`;
  };

  const sendMessageToIframe = (name:string, message:SendMessageToIframe) => {
    const iframe = iframes[name].contentWindow;
    if (!iframe || !originForIframes) return;

    iframe.postMessage(message, originForIframes);
  };

  const dataForIframe = (fieldName:string) => {
    return fieldNameIsMainIframe(fieldName)
      ? { fields: options.fields, hostOrigin: getHostOrigin() }
      : { fieldName, fieldOptions: options.fields[fieldName], hostOrigin: getHostOrigin(), mainIframeName };
  };

  const stylesForIframe = (fieldName:string): object => {
    if (fieldNameIsMainIframe(fieldName)) {
      return {
        display: 'none',
      };
    }

    return {
      border: '0px',
      margin: '0px',
      padding: '0px',
      width: 0,
      height: 0,
    };
  }

  const optionsForIframe = (fieldName:string): OptionsForIframe => {
    return {
      fieldName,
      elementToAppendIframeTo: elementToAppendIframeTo(fieldName),
      src: srcForIframe(fieldName),
      onLoadCallback: (iframe:HTMLIFrameElement) => {
        iframes[fieldName] = iframe;
        sendMessageToIframe(fieldName, { action: 'SET_OPTIONS', data: dataForIframe(fieldName) });
      },
      styles: stylesForIframe(fieldName),
    };
  }

  const createMainIframe = async () => {
    await createIframe(optionsForIframe(mainIframeName));
  }

  const createFields = () => {
    const promises:Promise<string>[] = [];

    Object.keys(options.fields).forEach((fieldName) => {
      promises.push(createIframe(optionsForIframe(fieldName)));
    });

    return Promise.all(promises);
  }

  const sendMessageToMainIframe = (message:SendMessageToIframe) => {
    const iframe = iframes[mainIframeName].contentWindow;
    if (!iframe || !originForIframes) return;

    iframe.postMessage(message, originForIframes);
  }

  return {
    create,
    tokenize,
  };
};

(window as any).PaymentProfileTokenizer = PaymentProfileTokenizer;
