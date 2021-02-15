import { IframesMessages, IframeOrigin } from '../helpers/IframeMessages';

class Client extends IframesMessages {
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

    this.startListeningOnMessages();
    this.createMainIframe();

    try {
      await this.createFields();
    } catch (err) {
      console.log(err);
    }
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

    await this.createIframe('mainIframe', styles);
  }

  optionsForIframe(fieldName) {
    if (fieldName === 'mainIframe') {
      return { fields: this.options.fields };
    } else {
      return { fieldName: fieldName };
    }
  }

  srcForIframe(fieldName) {
    return fieldName === "mainIframe" ? `${IframeOrigin}/dist/main.html` : `${IframeOrigin}/dist/field.html`;
  }

  elementToAppendIframeTo(fieldName) {
    return fieldName === 'mainIframe' ? document.body : document.querySelector(this.options.fields[fieldName]['selector']);
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
    this.iframes[name].contentWindow.postMessage(message, '*');
  }

  sendMessageToIframes(message) {
    Object.keys(this.iframes).filter(fieldName => fieldName !== "mainIframe").forEach(fieldName => {
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
