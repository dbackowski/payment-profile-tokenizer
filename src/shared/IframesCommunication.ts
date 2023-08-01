import { allowedIframeOrigins } from './helpers';

type ReferenceForHandleReceivedMessage = {
  (event:MessageEvent): void;
}

type Message = {
  action: string;
  data: object;
}

type ReceivedMessageToMethod = {
  [key:string]: MessageToMethod
}

type MessageToMethod = {
  method?: Function;
  skipOriginCheck?: boolean;
}

const IframesCommunication = (receivedMessageToMethod:ReceivedMessageToMethod) => {
  let referenceForHandleReceivedMessage:ReferenceForHandleReceivedMessage;

  const startListeningOnMessages = () => {
    referenceForHandleReceivedMessage = (message:MessageEvent) => handleReceivedMessage(message);
    window.addEventListener('message', referenceForHandleReceivedMessage);
  };

  const stopListeningOnMessages = () => {
    window.removeEventListener('message', referenceForHandleReceivedMessage);
  };

  const handleReceivedMessage = (message:MessageEvent) => {
    const { method, skipOriginCheck } = methodForReceivedMessage(message.data);

    if (!method) return;
    if (!validOriginMessage(message, <boolean>skipOriginCheck)) return;

    method.call(this, message.data);
  };

  const methodForReceivedMessage = (message:Message): MessageToMethod => {
    if (!checkIfMethodExistForReceivedMessage(message)) return {};

    return receivedMessageToMethod[message.action];
  };

  const checkIfMethodExistForReceivedMessage = (message:Message): boolean => {
    if (message.action == null) return false;
    if (!receivedMessageToMethod[message.action]) return false;

    return !!receivedMessageToMethod[message.action].method;
  };

  const validOriginMessage = (message:MessageEvent, skipOriginCheck:boolean): boolean => {
    if (skipOriginCheck) return true;

    return allowedIframeOrigins.includes(message.origin);
  };

  return {
    startListeningOnMessages,
    stopListeningOnMessages,
  };
}

export default IframesCommunication;
