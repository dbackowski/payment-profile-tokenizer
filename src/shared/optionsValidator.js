export default class OptionsValidator {
  static validate(options = {}) {
    // for now it will just checks if options is not empty
    return Object.keys(options).length > 0;
  }
}
