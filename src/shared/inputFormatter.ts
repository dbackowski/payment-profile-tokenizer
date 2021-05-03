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

  static format(type:string, element:HTMLInputElement): FormatResult {
    const formatMethod = InputFormatter.AVAILABLE_FORMATS[type];
    const carretPosition = element.selectionStart;

    if (!formatMethod) return { value: element.value, carretPosition: carretPosition };

    return formatMethod.call(this, element, carretPosition);
  }

  static creditCardFormat(element:HTMLInputElement, carretPosition:number): FormatResult {
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

  static monthFormat(element:HTMLInputElement, carretPosition:number): FormatResult {
    const value = element.value.replace(new RegExp(/[^\d]/, 'ig'), '').slice(0, 2);

    return { value, carretPosition };
  }

  static yearFormat(element:HTMLInputElement, carretPosition:number): FormatResult {
    const value = element.value.replace(new RegExp(/[^\d]/, 'ig'), '').slice(0, 4);

    return { value, carretPosition };
  }

  static cvcFormat(element:HTMLInputElement, carretPosition:number): FormatResult {
    const value = element.value.replace(new RegExp(/[^\d]/, 'ig'), '').slice(0, 4);

    return { value, carretPosition };
  }
}
