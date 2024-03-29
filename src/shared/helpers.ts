import { fieldsForType } from './fieldsForType';
import { setStylesOnElement } from './styleElement';

type OnLoadCallback = {
  (iframe: HTMLIFrameElement): void;
}

type IframeOptions = {
  src: string;
  fieldName: string;
  styles: object;
  onLoadCallback: OnLoadCallback;
  elementToAppendIframeTo: HTMLElement|null;
}

type Field = {
  selector: string;
  label: string;
  placeholder?: string;
  style: object;
  liveValidation: boolean;
}

type Options = {
  type: string;
  liveValidation?: boolean;
  fields: {
    [key:string]: Field;
  }
}

export const generateMainIframeName = () =>
  `mainIframe%${[...Array(30)].map(() => Math.random().toString(36)[2] || '0').join('')}`;

export const allowedIframeOrigins = [
  'http://localhost:4000',
  'http://127.0.0.1:4000',
];

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

export const postData = async(url:string = '', data:Object = {}):Promise<any> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  const jsonResponse = await response.json();

  if (response.ok) {
    return jsonResponse
  } else {
    throw new Error(jsonResponse.error);
  }
};
