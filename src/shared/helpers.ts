import fieldsForType from './fieldsForType';

interface OnLoadCallback {
  (iframe: HTMLIFrameElement): void;
}

interface IframeOptions {
  src: string;
  fieldName: string;
  styles: object;
  onLoadCallback: OnLoadCallback;
  elementToAppendIframeTo: HTMLIFrameElement;
}

interface Fields {
  [key:string]: Field;
}

interface Field {
  selector: string,
  label: string,
  placeholder?: string,
  style: object;
}

interface Options {
  type: string;
  fields: Fields;
}

export const setStylesOnElement = (element:HTMLElement, styles:object) => {
  Object.assign(element.style, styles);
};

export const createIframe = (options:IframeOptions) => new Promise((resolve) => {
  const iframe = document.createElement('iframe');

  iframe.src = options.src;
  iframe.id = options.fieldName;
  iframe.name = options.fieldName;
  iframe.sandbox = 'allow-scripts allow-same-origin';
  setStylesOnElement(iframe, options.styles);

  iframe.onload = () => {
    options.onLoadCallback(iframe);
    resolve(`Successfully loaded: ${iframe}`);
  };

  options.elementToAppendIframeTo.appendChild(iframe);
});

export const lunCheck = (creditCardNumber:string) => {
  const result = ((arr:number[]) => {
    const check = (ccNum:string) => {
      let len:number = ccNum.length;
      let bit:number = 1;
      let sum:number = 0;
      let val:number;

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

export const getHostOrigin = (): string => window.location.origin;

export const mergeOptionsWithOptionsForType = (options:Options) => {
  const fields = fieldsForType.fields(options.type);
  Object.keys(options.fields).forEach((key) => Object.assign(options.fields[key], fields[key]));
};
