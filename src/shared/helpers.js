import fieldsForType from './fieldsForType';

export const setStylesOnElement = (element, styles) => {
  Object.assign(element.style, styles);
};

export const createIframe = (options = {}) => new Promise((resolve) => {
  const iframe = document.createElement('iframe');

  iframe.src = options.src;
  iframe.id = options.fieldName;
  iframe.name = options.fieldName;
  iframe.sandbox = 'allow-scripts allow-same-origin';
  setStylesOnElement(iframe, options.styles);

  iframe.onload = () => {
    options.onLoadCallback(iframe);
    resolve();
  };

  options.elementToAppendIframeTo.appendChild(iframe);
});

export const lunCheck = (creditCardNumber) => {
  const result = ((arr) => {
    const check = (ccNum) => {
      let len = ccNum.length;
      let bit = 1;
      let sum = 0;
      let val;

      while (len) {
        val = parseInt(ccNum.charAt(len -= 1), 10);
        sum += (bit ^= 1) ? arr[val] : val; // eslint-disable-line no-cond-assign, no-bitwise
      }

      return sum && sum % 10 === 0;
    };

    return check;
  })([0, 2, 4, 6, 8, 1, 3, 5, 7, 9]);

  return result(creditCardNumber);
};

export const getHostOrigin = () => window.location.origin;

export const mergeOptionsWithOptionsForType = (options) => {
  const fields = fieldsForType.fields(options.type);
  Object.keys(options.fields).forEach((key) => Object.assign(options.fields[key], fields[key]));
};
