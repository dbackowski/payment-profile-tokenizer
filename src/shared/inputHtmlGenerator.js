import { setStylesOnElement } from './helpers';

export default class InputHtmlGenerator {
  fieldName;

  type;

  options = {};

  constructor(fieldName, type, options = {}) {
    this.fieldName = fieldName;
    this.type = type;
    this.options = options;
  }

  output() {
    const span = document.createElement('span');
    const label = document.createElement('label');
    const input = document.createElement('input');

    input.name = this.options.fieldName;
    input.className = 'input';
    setStylesOnElement(input, this.options.styles.field);

    label.setAttribute('for', input.name);
    label.innerText = this.options.fieldLabel;
    setStylesOnElement(label, this.options.styles.label);

    span.appendChild(label);
    span.appendChild(input);

    return span;
  }
}
