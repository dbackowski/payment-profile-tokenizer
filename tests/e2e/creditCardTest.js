import { Selector, fixture, test } from 'testcafe';
import fireBlurEventOnElement from '../support/helpers';

let firstNameIframe;
let lastNameIframe;
let creditCardNumberIframe;
let expirationMonthIframe;
let expirationYearIframe;
let cvcIframe;

fixture('Credit Card Test')
  .page('http://127.0.0.1:4000/tests/examples/credit-card.html')
  .beforeEach(async () => {
    firstNameIframe = await Selector('#first-name').find('iframe');
    lastNameIframe = await Selector('#last-name').find('iframe');
    creditCardNumberIframe = await Selector('#credit-card-number').find('iframe');
    expirationMonthIframe = await Selector('#expiration-month').find('iframe');
    expirationYearIframe = await Selector('#expiration-year').find('iframe');
    cvcIframe = await Selector('#cvc').find('iframe');
  });

test('With valid data it should receive token', async (t) => {
  await t
    .switchToIframe(firstNameIframe)
    .typeText('#firstName', 'John')
    .switchToMainWindow()
    .switchToIframe(lastNameIframe)
    .typeText('#lastName', 'Doe')
    .switchToMainWindow()
    .switchToIframe(creditCardNumberIframe)
    .typeText('#creditCardNumber', '42424242asd42424242') // this will check input formatting
    .switchToMainWindow()
    .switchToIframe(expirationMonthIframe)
    .typeText('#expirationMonth', '12')
    .switchToMainWindow()
    .switchToIframe(expirationYearIframe)
    .typeText('#expirationYear', '2025')
    .switchToMainWindow()
    .switchToIframe(cvcIframe)
    .typeText('#cvv', '123')
    .switchToMainWindow();

  const consoleBefore = await t.getBrowserConsoleMessages();

  await t
    .expect(consoleBefore.log.length).eql(0)
    .click('#submit');

  const consoleAfter = await t.getBrowserConsoleMessages();

  await t
    .expect(consoleAfter.log[0]).eql('token_12345');
});

test('With a credit card number that will raise an error on the backend it should write error to the console', async (t) => {
  await t
    .switchToIframe(firstNameIframe)
    .typeText('#firstName', 'John')
    .switchToMainWindow()
    .switchToIframe(lastNameIframe)
    .typeText('#lastName', 'Doe')
    .switchToMainWindow()
    .switchToIframe(creditCardNumberIframe)
    .typeText('#creditCardNumber', '4111111111111111')
    .switchToMainWindow()
    .switchToIframe(expirationMonthIframe)
    .typeText('#expirationMonth', '12')
    .switchToMainWindow()
    .switchToIframe(expirationYearIframe)
    .typeText('#expirationYear', '2025')
    .switchToMainWindow()
    .switchToIframe(cvcIframe)
    .typeText('#cvv', '123')
    .switchToMainWindow();

  const consoleBefore = await t.getBrowserConsoleMessages();

  await t
    .expect(consoleBefore.error.length).eql(0)
    .click('#submit');

  const consoleAfter = await t.getBrowserConsoleMessages();

  await t
    .expect(consoleAfter.error[0]).eql('Something went wrong');
});

test('With invalid data it should show proper error messages', async (t) => {
  await t
    .click('#submit')
    .expect(Selector('#errors').innerText)
    .contains('firstName - Field can not be empty')
    .expect(Selector('#errors').innerText)
    .contains('lastName - Field can not be empty')
    .expect(Selector('#errors').innerText)
    .contains('creditCardNumber - Field can not be empty')
    .expect(Selector('#errors').innerText)
    .contains('expirationMonth - Field can not be empty')
    .expect(Selector('#errors').innerText)
    .contains('expirationYear - Field can not be empty')
    .expect(Selector('#errors').innerText)
    .contains('cvv - Field can not be empty');
});

test('With invalid data it should show proper error messages (live validation)', async (t) => {
  await t
    .switchToMainWindow()
    .switchToIframe(firstNameIframe);
  await fireBlurEventOnElement('#firstName');

  await t
    .switchToMainWindow()
    .switchToIframe(lastNameIframe);
  await fireBlurEventOnElement('#lastName');

  await t
    .switchToMainWindow()
    .switchToIframe(creditCardNumberIframe);
  await fireBlurEventOnElement('#creditCardNumber');

  await t
    .switchToMainWindow()
    .switchToIframe(expirationMonthIframe);
  await fireBlurEventOnElement('#expirationMonth');

  await t
    .switchToMainWindow()
    .switchToIframe(expirationYearIframe);
  await fireBlurEventOnElement('#expirationYear');

  await t
    .switchToMainWindow()
    .switchToIframe(cvcIframe);
  await fireBlurEventOnElement('#cvv');

  await t
    .switchToMainWindow()
    .expect(Selector('#errors').innerText)
    .contains('firstName - Field can not be empty')
    .expect(Selector('#errors').innerText)
    .contains('lastName - Field can not be empty')
    .expect(Selector('#errors').innerText)
    .contains('creditCardNumber - Field can not be empty')
    .expect(Selector('#errors').innerText)
    .contains('expirationMonth - Field can not be empty')
    .expect(Selector('#errors').innerText)
    .contains('expirationYear - Field can not be empty')
    .expect(Selector('#errors').innerText)
    .contains('cvv - Field can not be empty');
});
