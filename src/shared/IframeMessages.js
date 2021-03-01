export const IframeOrigin = 'http://localhost:4000';

export class IframesMessages {
  /*
    Redeclare this in the inherited classes, it should be in the format of:
    key - action name, value - object with key 'method' that will store reference
    to method that should handle this message.

    For example:
    {
      INPUT_SIZE: { method: this.setIframeSize }
    }

    If you do not want to check origin of the recevied message add skipOriginCheck: true
    like in this example:

    {
      SET_OPTIONS: { method: this.setOptions, skipOriginCheck: true },
    }
  */
  receivedMessageToMethod = {};

  constructor() {
    this.startListeningOnMessages();
  }

  startListeningOnMessages() {
    window.onmessage = (event) => {
      this.handleReceivedMessage(event);
    };
  }

  handleReceivedMessage(message) {
    const { method, skipOriginCheck } = this.methodForReceivedMessage(message.data);

    if (method == null) return;
    if (!this.validOriginMessage(message, skipOriginCheck)) return;

    method.call(this, message.data);
  }

  methodForReceivedMessage(message) {
    if (this.checkIfMethodExistForReceivedMessage(message)) {

      return this.receivedMessageToMethod[message.action];
    }
  }

  checkIfMethodExistForReceivedMessage(message) {
    if (message.action == null) return false;

    return this.receivedMessageToMethod.hasOwnProperty(message.action) &&
      this.receivedMessageToMethod[message.action].hasOwnProperty('method');
  }

  validOriginMessage(message, skipOriginCheck) {
    if (skipOriginCheck) return true;

    return message.origin === IframeOrigin;
  }
};
