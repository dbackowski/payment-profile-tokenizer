interface ReferenceForHandleReceivedMessage {
  (event:MessageEvent): void;
}

interface Message {
  action: string;
  data: object;
}

interface ReceivedMessageToMethod {
  [key:string]: {
    method?: Function;
    skipOriginCheck?: boolean;
  }
}

export default class IframesMessages {
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
  receivedMessageToMethod:ReceivedMessageToMethod = {};

  referenceForHandleReceivedMessage:ReferenceForHandleReceivedMessage;

  allowedIframeOrigins = [
    'http://localhost:4000',
  ];

  constructor() {
    this.referenceForHandleReceivedMessage = (message:MessageEvent) => this.handleReceivedMessage(message);
    this.startListeningOnMessages();
  }

  startListeningOnMessages() {
    window.addEventListener('message', this.referenceForHandleReceivedMessage);
  }

  stopListeningOnMessages() {
    window.removeEventListener('message', this.referenceForHandleReceivedMessage);
  }

  handleReceivedMessage(message:MessageEvent) {
    const { method, skipOriginCheck } = this.methodForReceivedMessage(message.data);

    if (method == null) return;
    if (!this.validOriginMessage(message, <boolean>skipOriginCheck)) return;

    method.call(this, message.data);
  }

  methodForReceivedMessage(message:Message) {
    if (!this.checkIfMethodExistForReceivedMessage(message)) return {};

    return this.receivedMessageToMethod[message.action];
  }

  checkIfMethodExistForReceivedMessage(message:Message) {
    if (message.action == null) return false;

    return this.receivedMessageToMethod[message.action]
      && this.receivedMessageToMethod[message.action].method;
  }

  validOriginMessage(message:MessageEvent, skipOriginCheck:boolean) {
    if (skipOriginCheck) return true;

    return this.allowedIframeOrigins.includes(message.origin);
  }
}
