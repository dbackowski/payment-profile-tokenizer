export default class fieldsForType {
  static FIELDS_FOR_TYPES = {
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

  static fields(type) {
    return fieldsForType.FIELDS_FOR_TYPES[type].fields;
  }

  static supportedTypes() {
    return Object.keys(fieldsForType.FIELDS_FOR_TYPES);
  }
}
