import { setStylesOnElement } from './helpers';

export default class InputHtmlGenerator {
  fieldName;

  options = {};

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
    let input;

    switch (this.options.type) {
      case 'text':
        input = this.inputTypeText();
        break;

      case 'select':
        input = this.inputTypeSelect();
        break;

      default:
        //
    }

    return input;
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

    Object.entries(this.options.selectOptions).forEach(([key, value]) => {
      const option = document.createElement('option');

      option.value = key;
      option.text = value;

      input.add(option);
    });

    input.name = this.options.fieldName;
    input.className = 'select';
    setStylesOnElement(input, this.options.styles.field);

    return input;
  }
}
