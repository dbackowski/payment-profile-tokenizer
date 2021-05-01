interface Field {
  [key:string]: {
    validator?: string;
    inputFormat? :string;
  }
}

interface Fields {
  [key:string]: {
    [fields:string]: Field;
  }
}

export default class fieldsForType {
  static FIELDS_FOR_TYPES:Fields = {
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
          inputFormat: 'Month',
          validator: 'expirationMonth',
        },
        expirationYear: {
          inputFormat: 'Year',
          validator: 'expirationYear',
        },
        cvv: {
          inputFormat: 'cvc',
          validator: 'notEmpty',
        },
      },
    },
  }

  static fields(type:string): Field {
    return fieldsForType.FIELDS_FOR_TYPES[type].fields;
  }

  static supportedTypes(): string[] {
    return Object.keys(fieldsForType.FIELDS_FOR_TYPES);
  }
}
