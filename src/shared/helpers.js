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
