import { ClientFunction } from 'testcafe';

const fireBlurEventOnElement = ClientFunction((selector) => {
  const event = new Event('blur');
  document.querySelector(selector).dispatchEvent(event);
});

export default fireBlurEventOnElement;
