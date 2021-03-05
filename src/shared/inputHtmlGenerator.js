import { setStylesOnElement } from './helpers';

export default class InputHtmlGenerator {
  fieldName;

  options = {};

  inputTypes = {
    text: this.inputTypeText,
    select: this.inputTypeSelect,
  }

  constructor(fieldName, options = {}) {
    this.fieldName = fieldName;
    this.options = options;
  }

  output() {
    const span = document.createElement('span');
    const label = document.createElement('label');
    const input = this.inputForType();

    label.setAttribute('for', input.name);
    label.innerText = this.options.fieldLabel;
    setStylesOnElement(label, this.options.styles.label);

    span.appendChild(label);
    span.appendChild(input);

    return span;
  }

  inputForType() {
    return this.inputTypes[this.options.type]();
  }

  inputTypeText() {
    const input = document.createElement('input');

    input.name = this.options.fieldName;
    input.className = 'input';
    setStylesOnElement(input, this.options.styles.field);

    return input;
  }

  inputTypeSelect() {
    const input = document.createElement('select');

    this.options.options.forEach((option) => {
      const optionElem = document.createElement('option');

      optionElem.value = option.key;
      optionElem.text = option.value;

      input.add(optionElem);
    });

    input.name = this.options.fieldName;
    input.className = 'select';
    setStylesOnElement(input, this.options.styles.field);

    return input;
  }
}
