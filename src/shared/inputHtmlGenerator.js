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
    const div = document.createElement('div');
    const label = document.createElement('label');
    const input = this.inputForType();
    const errorMsgDiv = document.createElement('div');
    errorMsgDiv.className = 'error-msg';

    label.setAttribute('for', input.name);
    label.innerText = this.options.fieldLabel;
    setStylesOnElement(label, this.options.styles.label);

    div.appendChild(label);
    div.appendChild(input);
    div.appendChild(errorMsgDiv);

    return div;
  }

  inputForType() {
    return this.inputTypes[this.options.type].call(this);
  }

  inputTypeText() {
    const input = document.createElement('input');

    input.id = this.fieldName;
    input.name = this.fieldName;
    input.className = 'input';
    input.placeholder = this.options.placeholder;
    setStylesOnElement(input, this.options.styles.field);

    return input;
  }

  inputTypeSelect() {
    const input = document.createElement('select');

    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.text = this.options.placeholder;
    placeholderOption.setAttribute('disabled', '');
    placeholderOption.setAttribute('selected', '');

    input.add(placeholderOption);

    this.options.options.forEach((option) => {
      const optionElem = document.createElement('option');

      optionElem.value = option.value;
      optionElem.text = option.text;

      input.add(optionElem);
    });

    input.id = this.fieldName;
    input.name = this.fieldName;
    input.className = 'select';
    setStylesOnElement(input, this.options.styles.field);

    return input;
  }
}
