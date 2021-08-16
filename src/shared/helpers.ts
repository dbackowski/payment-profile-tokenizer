import { fieldsForType } from './fieldsForType';

interface OnLoadCallback {
  (iframe: HTMLIFrameElement): void;
}

interface IframeOptions {
  src: string;
  fieldName: string;
  styles: object;
  onLoadCallback: OnLoadCallback;
  elementToAppendIframeTo: HTMLElement|null;
}

interface Field {
  selector: string;
  label: string;
  placeholder?: string;
  style: object;
  liveValidation: boolean;
}

interface Options {
  type: string;
  liveValidation?: boolean;
  fields: {
    [key:string]: Field;
  }
}

export const mainIframeName = 'mainIframe';

export const allowedIframeOrigins = [
  'http://localhost:4000',
];

export const setStylesOnElement = (element:HTMLElement, styles:object) => {
  Object.assign(element.style, styles);
};

export const createIframe = (options:IframeOptions): Promise<string> => new Promise((resolve, reject) => {
  if (!options.elementToAppendIframeTo) return reject('Element to append iframe to does not exists');

  const iframe = document.createElement('iframe');

  iframe.src = options.src;
  iframe.id = options.fieldName;
  iframe.name = options.fieldName;
  iframe.sandbox.add('allow-scripts')
  iframe.sandbox.add('allow-same-origin');
  setStylesOnElement(iframe, options.styles);

  iframe.onload = () => {
    options.onLoadCallback(iframe);
    resolve(`Successfully loaded: ${iframe}`);
  };

  options.elementToAppendIframeTo.appendChild(iframe);
});

export const lunCheck = (creditCardNumber:string): boolean => {
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

      return (sum && sum % 10 === 0) as boolean;
    };

    return check;
  })([0, 2, 4, 6, 8, 1, 3, 5, 7, 9]);

  return result(creditCardNumber);
};

export const getHostOrigin = (): string => window.location.origin;

export const mergeOptionsWithOptionsForType = (options:Options) => {
  const fields = fieldsForType(options.type);

  Object.keys(options.fields).forEach((key) => {
    options.fields[key].liveValidation = !!options.liveValidation;
    Object.assign(options.fields[key], fields[key])
  });
};
