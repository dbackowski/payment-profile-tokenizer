import { setStylesOnElement } from './helpers';

interface Option {
  value:string;
  text:string;
}
interface Options {
  fieldLabel: string;
  type: string;
  placeholder: string;
  options?: Option[];
  styles: {
    field: object;
    label: object;
  };
}

interface InputTypes {
  [key: string]: Function;
}

const InputHtmlGenerator = (fieldName:string, options:Options) => {
  const inputTypeText = ():HTMLInputElement => {
    const input = document.createElement('input');

    input.id = fieldName;
    input.name = fieldName;
    input.className = 'input';
    input.placeholder = options.placeholder;
    setStylesOnElement(input, options.styles.field);

    return input;
  }

  const inputTypeSelect = ():HTMLSelectElement => {
    const input = document.createElement('select');

    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.text = options.placeholder;
    placeholderOption.setAttribute('disabled', '');
    placeholderOption.setAttribute('selected', '');

    input.add(placeholderOption);

    options.options!.forEach((option) => {
      const optionElem = document.createElement('option');

      optionElem.value = option.value;
      optionElem.text = option.text;

      input.add(optionElem);
    });

    input.id = fieldName;
    input.name = fieldName;
    input.className = 'select';
    setStylesOnElement(input, options.styles.field);

    return input;
  }

  const inputTypes:InputTypes = {
    text: inputTypeText,
    select: inputTypeSelect,
  }

  const output = ():HTMLDivElement => {
    const div = document.createElement('div');
    const input = inputForType();

    if (options.fieldLabel) {
      const label = document.createElement('label');
      label.setAttribute('for', input.name);
      label.innerText = options.fieldLabel;
      setStylesOnElement(label, options.styles.label);
      div.appendChild(label);
    }

    div.appendChild(input);

    return div;
  }

  const inputForType = ():HTMLInputElement | HTMLSelectElement => inputTypes[options.type].call(this);

  return {
    output,
  };
}

export default InputHtmlGenerator;
