export const setStylesOnElement = (element:HTMLElement, styles:object) => {
  Object.entries(styles).forEach(([selector, values]) => {
    if (isPseudoClassOrElem(selector)) {
      addInternalStyleToPage(element, selector, values);
    } else {
      element.style[selector] = values
    }
  })
};

const isPseudoClassOrElem = (style:string) => style.startsWith(':');

const addInternalStyleToPage = (element:HTMLElement, selector:string, values:object) => {
  const styleNode = document.createElement('style');
  const cssStyle = `#${element.id}${selector} { ${convertCssObjectToText(values)} }`;
  const styleText = document.createTextNode(cssStyle);
  const headElem = document.querySelector('head');

  if (!headElem) return;

  styleNode.appendChild(styleText);
  headElem.appendChild(styleNode);
};

const convertCssObjectToText = (cssObject:object) => {
  return Object.entries(cssObject).map(([name, values]) => {
    return `${convertNameFromCssObject(name)}: ${values};`;
  }).join(' ');
};

const convertNameFromCssObject = (name:string) => {
  return name.split(/(?=[A-Z])/).join('-').toLowerCase();
};
