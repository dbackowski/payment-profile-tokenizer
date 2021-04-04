import IframesMessages from '../shared/IframeMessages';
import { setStylesOnElement, createIframe, getHostOrigin } from '../shared/helpers';
import optionsValidator from '../shared/optionsValidator';

export default class Client extends IframesMessages {
  static mainIframeName = 'mainIframe';

  options = {};

  iframes = {};

  tokenizeOnSuccess;

  tokenizeOnError;

  receivedMessageToMethod = {
    INPUT_SIZE: { method: this.setIframeSize },
    IVALID_FIELDS: { method: this.invalidFields },
    RECEIVED_TOKEN: { method: this.receivedToken },
  };

  originForIframes;

  async create(options) {
    if (Object.keys(this.iframes).length > 0) {
      this.remove();
      this.startListeningOnMessages();
    }

    this.options = options;
    this.originForIframes = this.getOriginForIframes();

    if (!this.originForIframes || !optionsValidator.validate(options)) return;

    await this.createMainIframe();
    await this.createFields();
  }

  remove() {
    this.stopListeningOnMessages();

    Object.entries(this.iframes).forEach(([fieldName, iframe]) => {
      iframe.remove();
      delete this.iframes[fieldName];
    });
  }

  tokenize() {
    this.sendMessageToMainIframe({ action: 'TOKENIZE' });

    return new Promise((resolve, reject) => {
      this.tokenizeOnSuccess = resolve;
      this.tokenizeOnError = reject;
    });
  }

  createFields() {
    const promises = [];

    Object.keys(this.options.fields).forEach((fieldName) => {
      promises.push(createIframe(this.optionsForIframe(fieldName)));
    });

    return Promise.all(promises);
  }

  async createMainIframe() {
    await createIframe(this.optionsForIframe(Client.mainIframeName));
  }

  static stylesForIframe(fieldName) {
    if (Client.fieldNameIsMainIframe(fieldName)) {
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

  optionsForIframe(fieldName) {
    return {
      fieldName,
      elementToAppendIframeTo: this.elementToAppendIframeTo(fieldName),
      src: this.srcForIframe(fieldName),
      onLoadCallback: (iframe) => {
        this.iframes[fieldName] = iframe;
        this.sendMessageToIframe(fieldName, { action: 'SET_OPTIONS', data: this.dataForIframe(fieldName) });
      },
      styles: Client.stylesForIframe(fieldName),
    };
  }

  static fieldNameIsMainIframe(fieldName) {
    return fieldName === Client.mainIframeName;
  }

  dataForIframe(fieldName) {
    return Client.fieldNameIsMainIframe(fieldName)
      ? { fields: this.options.fields, hostOrigin: getHostOrigin() }
      : { [fieldName]: this.options.fields[fieldName], hostOrigin: getHostOrigin() };
  }

  srcForIframe(fieldName) {
    return Client.fieldNameIsMainIframe(fieldName)
      ? `${this.originForIframes}/dist/main.html`
      : `${this.originForIframes}/dist/field.html`;
  }

  elementToAppendIframeTo(fieldName) {
    return Client.fieldNameIsMainIframe(fieldName)
      ? document.body
      : document.querySelector(this.options.fields[fieldName].selector);
  }

  sendMessageToIframe(name, message) {
    this.iframes[name].contentWindow.postMessage(message, this.originForIframes);
  }

  sendMessageToIframes(message) {
    Object.keys(this.iframes)
      .filter((fieldName) => fieldName !== Client.mainIframeName)
      .forEach((fieldName) => {
        this.sendMessageToIframe(fieldName, message);
      });
  }

  sendMessageToMainIframe(message) {
    this.iframes[Client.mainIframeName].contentWindow.postMessage(message, this.originForIframes);
  }

  setIframeSize(message) {
    const iframe = this.iframes[message.data.fieldName];

    const styles = {
      width: message.data.width,
      height: message.data.height,
    };

    setStylesOnElement(iframe, styles);
  }

  invalidFields(message) {
    this.tokenizeOnError({ error: 'Some fields are not valid', invalidField: message.invalidFields });
  }

  receivedToken(message) {
    this.tokenizeOnSuccess(message.message);
  }

  getOriginForIframes() {
    const scriptElemForClient = Array.from(document.querySelectorAll('script')).find((script) => {
      if (!script.src) return null;

      return this.allowedIframeOrigins.find((origin) => script.src.startsWith(origin));
    });

    if (!scriptElemForClient) return null;

    return new URL(scriptElemForClient.src).origin;
  }
}

window.Client = Client;
