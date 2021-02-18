import { IframesMessages, IframeOrigin } from '../helpers/IframeMessages';

export class Client extends IframesMessages {
  static mainIframeName = 'mainIframe';
  options = {};
  iframes = {};
  receivedMessageToMethod = {
    'INPUT_SIZE': { method: this.setIframeSize },
  };

  constructor(options) {
    super();
    this.options = options;
  }

  async create() {
    if (!this.validateOptions()) return

    await this.createMainIframe();
    await this.createFields();
  }

  tokenize() {
    this.sendMessageToIframes({ action: 'SEND_FIELD_VALUE_TO_MAIN_IFRAME' });
  }

  validateOptions() {
    // for now it will always returns true
    return true;
  }

  createFields() {
    const iframes = [];
    const styles = {
      border: '0px',
      margin: '0px',
      padding: '0px',
      width: 0,
      height: 0,
    }

    Object.entries(this.options.fields).forEach(field => {
      const [name, fieldOptions] = field;
      iframes.push(this.createIframe(name, styles));
    });

    return Promise.all(iframes);
  }

  async createMainIframe() {
    const styles = {
      display: 'none',
    };

    await this.createIframe(Client.mainIframeName, styles);
  }

  optionsForIframe(fieldName) {
    return fieldName === Client.mainIframeName ? { fields: this.options.fields } : { fieldName: fieldName };
  }

  srcForIframe(fieldName) {
    return fieldName === Client.mainIframeName ? `${IframeOrigin}/dist/main.html` : `${IframeOrigin}/dist/field.html`;
  }

  elementToAppendIframeTo(fieldName) {
    return fieldName === Client.mainIframeName ? document.body : document.querySelector(this.options.fields[fieldName]['selector']);
  }

  createIframe(fieldName, styles = {}) {
    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe');
      const data = this.optionsForIframe(fieldName);
      const src = this.srcForIframe(fieldName);

      iframe.src = src;
      iframe.id = fieldName;
      iframe.name = fieldName;
      this.setStylesOnElement(iframe, styles);

      iframe.onload = () => {
        this.sendMessageToIframe(fieldName, { action: 'SET_OPTIONS', data: data });
        resolve();
      }

      this.elementToAppendIframeTo(fieldName).appendChild(iframe);
      this.iframes[fieldName] = iframe;
    });
  }

  setStylesOnElement(element, styles) {
    Object.assign(element.style, styles);
  }

  sendMessageToIframe(name, message) {
    this.iframes[name].contentWindow.postMessage(message, IframeOrigin);
  }

  sendMessageToIframes(message) {
    Object.keys(this.iframes).filter(fieldName => fieldName !== Client.mainIframeName).forEach(fieldName => {
      this.sendMessageToIframe(fieldName, message);
    })
  }

  setIframeSize(message) {
    const iframe = this.iframes[message.data.fieldName];
    const styles = {
      width: message.data.width + 20 + 'px',
      height: message.data.height + 23 + 'px',
    }

    this.setStylesOnElement(iframe, styles);
  }
};

window.Client = Client
