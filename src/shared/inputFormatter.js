export default class InputFormatter {
  static AVAILABLE_FORMATS = {
    CREDIT_CARD: InputFormatter.creditCardFormat,
    MONTH: InputFormatter.monthFormat,
    YEAR: InputFormatter.yearFormat,
    CVC: InputFormatter.cvcFormat,
  };

  static format(type, value) {
    const formatMethod = InputFormatter.AVAILABLE_FORMATS[type];

    if (!formatMethod) return value;

    return formatMethod.call(this, value);
  }

  static creditCardFormat(value) {
    return value.replace(new RegExp(/[^\d]/, 'ig'), '')
      .slice(0, 16)
      .split(/([0-9]{4})/g)
      .filter((e) => e !== '')
      .join(' ');
  }

  static monthFormat(value) {
    return value.replace(new RegExp(/[^\d]/, 'ig'), '').slice(0, 2);
  }

  static yearFormat(value) {
    return value.replace(new RegExp(/[^\d]/, 'ig'), '').slice(0, 4);
  }

  static cvcFormat(value) {
    return value.replace(new RegExp(/[^\d]/, 'ig'), '').slice(0, 4);
  }
}
