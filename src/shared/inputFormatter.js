export default class InputFormatter {
  static AVAILABLE_FORMATS = {
    CREDIT_CARD: InputFormatter.creditCardFormat,
    MONTH: InputFormatter.monthFormat,
    YEAR: InputFormatter.yearFormat,
    CVC: InputFormatter.cvcFormat,
  };

  static format(type, element) {
    const formatMethod = InputFormatter.AVAILABLE_FORMATS[type];

    if (!formatMethod) return element;

    return formatMethod.call(this, element);
  }

  static creditCardFormat(element) {
    let carretPosition = element.selectionStart;

    const value = element.value.replace(new RegExp(/[^\d]/, 'ig'), '')
      .slice(0, 16)
      .split(/([0-9]{4})/g)
      .filter((e) => e !== '')
      .join(' ');

    if (carretPosition % 5 === 0) {
      carretPosition += 1;
    }

    return { value, carretPosition };
  }

  static monthFormat(element) {
    const value = element.value.replace(new RegExp(/[^\d]/, 'ig'), '').slice(0, 2);
    const carretPosition = element.selectionStart;

    return { value, carretPosition };
  }

  static yearFormat(element) {
    const value = element.value.replace(new RegExp(/[^\d]/, 'ig'), '').slice(0, 4);
    const carretPosition = element.selectionStart;

    return { value, carretPosition };
  }

  static cvcFormat(element) {
    const value = element.value.replace(new RegExp(/[^\d]/, 'ig'), '').slice(0, 4);
    const carretPosition = element.selectionStart;

    return { value, carretPosition };
  }
}
