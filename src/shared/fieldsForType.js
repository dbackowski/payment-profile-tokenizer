export default class fieldsForType {
  static FIELDS_FOR_TYPES = {
    creditCard: {
      fields: {
        firstName: {
          validator: 'NOT_EMPTY',
        },
        lastName: {
          validator: 'NOT_EMPTY',
        },
        creditCardNumber: {
          inputFormat: 'CREDIT_CARD',
          validator: 'CREDIT_CARD_NUMBER',
        },
        expirationMonth: {
          inputFormat: 'MONTH',
          validator: 'EXPIRATION_MONTH',
        },
        expirationYear: {
          inputFormat: 'YEAR',
          validator: 'EXPIRATION_YEAR',
        },
        cvv: {
          inputFormat: 'CVC',
          validator: 'NOT_EMPTY',
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
