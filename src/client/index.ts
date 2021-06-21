import IframesMessages from '../shared/IframeMessages';
import {
  setStylesOnElement,
  createIframe,
  getHostOrigin,
  mergeOptionsWithOptionsForType,
} from '../shared/helpers';
import optionsValidator from '../shared/optionsValidator';

interface Iframes {
  [key:string]: HTMLIFrameElement;
}

interface Field {
  selector: string;
  label: string;
  placeholder: string;
  liveValidation: boolean;
  style: object;
}

interface Options {
  type: string;
  liveValidation?: boolean;
  fields: {
    [key:string]: Field;
  }
}

interface OnLoadCallback {
  (iframe: HTMLIFrameElement): void;
}

interface OptionsForIframe {
  fieldName:string;
  elementToAppendIframeTo: HTMLElement|null;
  src:string;
  onLoadCallback:OnLoadCallback;
  styles:object;
}

interface SendMessageToIframe {
  action:string;
  data?:object;
}

interface SetIframeSize {
  action:string;
  data: {
    fieldName:string;
    width:string;
    height:string;
  }
}

interface InvalidFields {
  action:string;
  data: {
    invalidFields:string[];
  }
}

interface ReceivedToken {
  action:string;
  data: {
    token:string;
  }
}

export default class Client extends IframesMessages {
  static mainIframeName = 'mainIframe';

  private options:Options = { type: '', fields: {} };

  private iframes:Iframes = {};

  private tokenizeOnSuccess:Function = () => {};

  private tokenizeOnError:Function = () => {};

  protected receivedMessageToMethod = {
    INPUT_SIZE: { method: this.setIframeSize },
    IVALID_FIELDS: { method: this.invalidFields },
    RECEIVED_TOKEN: { method: this.receivedToken },
  };

  private originForIframes:string = '';

  async create(options:Options) {
    if (Object.keys(this.iframes).length > 0) {
      this.remove();
      this.startListeningOnMessages();
    }

    this.options = options;
    this.originForIframes = this.getOriginForIframes();

    if (!this.originForIframes) return;

    await this.createMainIframe();

    const {
      valid: optionsValid,
      errorMessage: optionsInvalidErrorMessage,
    } = optionsValidator.validate(options);

    if (optionsValid) {
      mergeOptionsWithOptionsForType(options);
      this.sendMessageToMainIframe({ action: 'SET_OPTIONS', data: this.dataForIframe(Client.mainIframeName) });

      await this.createFields();
    } else {
      console.error(optionsInvalidErrorMessage); // eslint-disable-line no-console
    }
  }

  tokenize() {
    this.sendMessageToMainIframe({ action: 'TOKENIZE' });

    return new Promise((resolve, reject) => {
      this.tokenizeOnSuccess = resolve;
      this.tokenizeOnError = reject;
    });
  }

  private remove() {
    this.stopListeningOnMessages();

    Object.entries(this.iframes).forEach(([fieldName, iframe]) => {
      iframe.remove();
      delete this.iframes[fieldName];
    });
  }

  private createFields() {
    const promises:Promise<string>[] = [];

    Object.keys(this.options.fields).forEach((fieldName) => {
      promises.push(createIframe(this.optionsForIframe(fieldName)));
    });

    return Promise.all(promises);
  }

  private async createMainIframe() {
    await createIframe(this.optionsForIframe(Client.mainIframeName));
  }

  private stylesForIframe(fieldName:string): object {
    if (this.fieldNameIsMainIframe(fieldName)) {
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

  private optionsForIframe(fieldName:string): OptionsForIframe {
    return {
      fieldName,
      elementToAppendIframeTo: this.elementToAppendIframeTo(fieldName),
      src: this.srcForIframe(fieldName),
      onLoadCallback: (iframe:HTMLIFrameElement) => {
        this.iframes[fieldName] = iframe;
        this.sendMessageToIframe(fieldName, { action: 'SET_OPTIONS', data: this.dataForIframe(fieldName) });
      },
      styles: this.stylesForIframe(fieldName),
    };
  }

  private fieldNameIsMainIframe(fieldName:string):boolean {
    return fieldName === Client.mainIframeName;
  }

  private dataForIframe(fieldName:string) {
    return this.fieldNameIsMainIframe(fieldName)
      ? { fields: this.options.fields, hostOrigin: getHostOrigin() }
      : { fieldName, fieldOptions: this.options.fields[fieldName], hostOrigin: getHostOrigin() };
  }

  private srcForIframe(fieldName:string) {
    return this.fieldNameIsMainIframe(fieldName)
      ? `${this.originForIframes}/dist/main.html`
      : `${this.originForIframes}/dist/field.html`;
  }

  private elementToAppendIframeTo(fieldName:string): HTMLElement|null {
    return this.fieldNameIsMainIframe(fieldName)
      ? document.body
      : document.querySelector(this.options.fields[fieldName].selector);
  }

  private sendMessageToIframe(name:string, message:SendMessageToIframe) {
    const iframe = this.iframes[name].contentWindow;
    if (!iframe) return;

    iframe.postMessage(message, this.originForIframes);
  }

  private sendMessageToIframes(message:SendMessageToIframe) {
    Object.keys(this.iframes)
      .filter((fieldName) => fieldName !== Client.mainIframeName)
      .forEach((fieldName) => {
        this.sendMessageToIframe(fieldName, message);
      });
  }

  private sendMessageToMainIframe(message:SendMessageToIframe) {
    const iframe = this.iframes[Client.mainIframeName].contentWindow;
    if (!iframe) return;

    iframe.postMessage(message, this.originForIframes);
  }

  private setIframeSize(message:SetIframeSize) {
    const iframe = this.iframes[message.data.fieldName];

    const styles = {
      width: message.data.width,
      height: message.data.height,
    };

    setStylesOnElement(iframe, styles);
  }

  private invalidFields(message:InvalidFields) {
    this.tokenizeOnError({ error: 'Some fields are not valid', invalidFields: message.data.invalidFields });
  }

  private receivedToken(message:ReceivedToken) {
    this.tokenizeOnSuccess(message.data.token);
  }

  private getOriginForIframes():string {
    const scriptElemForClient = Array.from(document.querySelectorAll('script')).find((script) => {
      if (!script.src) return null;

      return this.allowedIframeOrigins.find((origin) => script.src.startsWith(origin));
    });

    if (!scriptElemForClient) return '';

    return new URL(scriptElemForClient.src).origin;
  }
}

(window as any).Client = Client;
