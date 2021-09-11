interface AvailableForms {
  [key:string]: Function;
}

interface FormatResult {
  value: string;
  carretPosition: HTMLInputElement["selectionStart"];
}

const creditCardFormat = (element:HTMLInputElement, carretPosition:number):FormatResult => {
  const value = element.value.replace(new RegExp(/[^\d]/, 'ig'), '')
    .slice(0, 16)
    .split(/([0-9]{4})/g)
    .filter((e) => e !== '')
    .join(' ');

  if (carretPosition && carretPosition % 5 === 0) {
    carretPosition += 1;
  }

  return { value, carretPosition };
}

const monthFormat = (element:HTMLInputElement, carretPosition:number):FormatResult => {
  const value = element.value.replace(new RegExp(/[^\d]/, 'ig'), '').slice(0, 2);

  return { value, carretPosition };
}

const yearFormat = (element:HTMLInputElement, carretPosition:number):FormatResult => {
  const value = element.value.replace(new RegExp(/[^\d]/, 'ig'), '').slice(0, 4);

  return { value, carretPosition };
}

const cvcFormat = (element:HTMLInputElement, carretPosition:number):FormatResult => {
  const value = element.value.replace(new RegExp(/[^\d]/, 'ig'), '').slice(0, 4);

  return { value, carretPosition };
}

const AVAILABLE_FORMATS: AvailableForms = {
  creditCardNumber: creditCardFormat,
  month: monthFormat,
  year: yearFormat,
  cvc: cvcFormat,
};

const format = (type:string, element:HTMLInputElement):FormatResult => {
  const formatMethod = AVAILABLE_FORMATS[type];
  const carretPosition = element.selectionStart;

  if (!formatMethod) return { value: element.value, carretPosition: carretPosition };

  return formatMethod.call(null, element, carretPosition);
}

export default format;
