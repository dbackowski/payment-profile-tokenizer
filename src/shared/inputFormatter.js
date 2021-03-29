export default class InputFormatter {
  static AVAILABLE_FORMATS = {
    CREDIT_CARD: InputFormatter.creditCardFormat,
  };

  static format(type, value) {
    const formatMethod = InputFormatter.AVAILABLE_FORMATS[type];

    if (!formatMethod) return value;

    return formatMethod.call(this, value);
  }

  static creditCardFormat(value) {
    return value.replace(new RegExp(/[^\d]/, 'ig'), '');
  }
}
