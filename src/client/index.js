import { IframesMessages, IframeOrigin } from '../shared/IframeMessages';
import { setStylesOnElement, createIframe, getHostOrigin } from '../shared/helpers';
import optionsValidator from '../shared/optionsValidator';

export default class Client extends IframesMessages {
  static mainIframeName = 'mainIframe';

  options = {};

  iframes = {};

  receivedMessageToMethod = {
    INPUT_SIZE: { method: this.setIframeSize },
  };

  async create(options) {
    if (!optionsValidator.validate(options)) return;

    this.options = options;
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
    this.sendMessageToIframes({ action: 'SEND_FIELD_VALUE_TO_MAIN_IFRAME' });
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
      src: Client.srcForIframe(fieldName),
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

  static srcForIframe(fieldName) {
    return Client.fieldNameIsMainIframe(fieldName)
      ? `${IframeOrigin}/dist/main.html`
      : `${IframeOrigin}/dist/field.html`;
  }

  elementToAppendIframeTo(fieldName) {
    return Client.fieldNameIsMainIframe(fieldName)
      ? document.body
      : document.querySelector(this.options.fields[fieldName].selector);
  }

  sendMessageToIframe(name, message) {
    this.iframes[name].contentWindow.postMessage(message, IframeOrigin);
  }

  sendMessageToIframes(message) {
    Object.keys(this.iframes)
      .filter((fieldName) => fieldName !== Client.mainIframeName)
      .forEach((fieldName) => {
        this.sendMessageToIframe(fieldName, message);
      });
  }

  setIframeSize(message) {
    const iframe = this.iframes[message.data.fieldName];

    const styles = {
      width: `${message.data.width + 4}px`,
      height: `${message.data.height + 4}px`,
    };

    setStylesOnElement(iframe, styles);
  }
}

window.Client = Client;
