import fieldsForType from './fieldsForType';

export default class mergeOptionsWithOptionsForType {
  // TODO: Make this immutable
  static merge(options) {
    const fields = fieldsForType.fields(options.type);
    Object.keys(options.fields).forEach((key) => Object.assign(options.fields[key], fields[key]));
  }
}
