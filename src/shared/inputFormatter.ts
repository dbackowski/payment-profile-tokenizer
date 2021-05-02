interface AvailableForms {
  [key:string]: Function;
}

interface FormatResult {
  value: string;
  carretPosition: HTMLInputElement["selectionStart"];
}

export default class InputFormatter {
  static AVAILABLE_FORMATS: AvailableForms = {
    creditCardNumber: InputFormatter.creditCardFormat,
    month: InputFormatter.monthFormat,
    year: InputFormatter.yearFormat,
    cvc: InputFormatter.cvcFormat,
  };

  static format(type:string, element:HTMLInputElement): FormatResult | HTMLInputElement {
    const formatMethod = InputFormatter.AVAILABLE_FORMATS[type];

    console.log(typeof formatMethod);

    if (!formatMethod) return element;

    return formatMethod.call(this, element);
  }

  static creditCardFormat(element:HTMLInputElement): FormatResult {
    let carretPosition = element.selectionStart;

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

  static monthFormat(element:HTMLInputElement): FormatResult {
    const value = element.value.replace(new RegExp(/[^\d]/, 'ig'), '').slice(0, 2);
    const carretPosition = element.selectionStart;

    return { value, carretPosition };
  }

  static yearFormat(element:HTMLInputElement): FormatResult {
    const value = element.value.replace(new RegExp(/[^\d]/, 'ig'), '').slice(0, 4);
    const carretPosition = element.selectionStart;

    return { value, carretPosition };
  }

  static cvcFormat(element:HTMLInputElement): FormatResult {
    const value = element.value.replace(new RegExp(/[^\d]/, 'ig'), '').slice(0, 4);
    const carretPosition = element.selectionStart;

    return { value, carretPosition };
  }
}
