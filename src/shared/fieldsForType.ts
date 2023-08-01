type Field = {
  [key:string]: {
    validator?: string;
    inputFormat? :string;
  }
}

type Fields = {
  [key:string]: {
    [fields:string]: Field;
  }
}

const FIELDS_FOR_TYPES:Fields = {
  creditCard: {
    fields: {
      firstName: {
        validator: 'notEmpty',
      },
      lastName: {
        validator: 'notEmpty',
      },
      creditCardNumber: {
        inputFormat: 'creditCardNumber',
        validator: 'creditCardNumber',
      },
      expirationMonth: {
        inputFormat: 'month',
        validator: 'expirationMonth',
      },
      expirationYear: {
        inputFormat: 'year',
        validator: 'expirationYear',
      },
      cvv: {
        inputFormat: 'cvc',
        validator: 'notEmpty',
      },
    },
  },
}

const fieldsForType = (type:string):Field => FIELDS_FOR_TYPES[type].fields;

const supportedTypes = Object.keys(FIELDS_FOR_TYPES);

export {
  fieldsForType,
  supportedTypes
}
