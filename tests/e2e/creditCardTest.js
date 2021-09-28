import { Selector, fixture, test } from 'testcafe';
import fireBlurEventOnElement from '../support/helpers';

let firstNameIframe;
let lastNameIframe;
let creditCardNumberIframe;
let expirationMonthIframe;
let expirationYearIframe;
let cvcIframe;

fixture('Credit Card Test')
  .page('http://localhost:4000/tests/examples/credit-card.html')
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
    .expect(consoleAfter.log[0]).eql('here will be the token');
});

test('With invalid data it should show proper error messages', async (t) => {
  await t
    .click('#submit')
    .switchToIframe(firstNameIframe)
    .expect(Selector('.error-msg').visible)
    .ok()
    .expect(Selector('.error-msg').innerText)
    .eql('Field can not be empty')
    .switchToMainWindow()
    .switchToIframe(lastNameIframe)
    .expect(Selector('.error-msg').visible)
    .ok()
    .expect(Selector('.error-msg').innerText)
    .eql('Field can not be empty')
    .switchToMainWindow()
    .switchToIframe(creditCardNumberIframe)
    .expect(Selector('.error-msg').visible)
    .ok()
    .expect(Selector('.error-msg').innerText)
    .eql('Field can not be empty')
    .switchToMainWindow()
    .switchToIframe(expirationMonthIframe)
    .expect(Selector('.error-msg').visible)
    .ok()
    .expect(Selector('.error-msg').innerText)
    .eql('Field can not be empty')
    .switchToMainWindow()
    .switchToIframe(expirationYearIframe)
    .expect(Selector('.error-msg').visible)
    .ok()
    .expect(Selector('.error-msg').innerText)
    .eql('Field can not be empty')
    .switchToMainWindow()
    .switchToIframe(cvcIframe)
    .expect(Selector('.error-msg').visible)
    .ok()
    .expect(Selector('.error-msg').innerText)
    .eql('Field can not be empty');
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
    .switchToIframe(firstNameIframe)
    .expect(Selector('.error-msg').visible)
    .ok()
    .expect(Selector('.error-msg').innerText)
    .eql('Field can not be empty')
    .switchToMainWindow()
    .switchToIframe(lastNameIframe)
    .expect(Selector('.error-msg').visible)
    .ok()
    .expect(Selector('.error-msg').innerText)
    .eql('Field can not be empty')
    .switchToMainWindow()
    .switchToIframe(creditCardNumberIframe)
    .expect(Selector('.error-msg').visible)
    .ok()
    .expect(Selector('.error-msg').innerText)
    .eql('Field can not be empty')
    .switchToMainWindow()
    .switchToIframe(expirationMonthIframe)
    .expect(Selector('.error-msg').visible)
    .ok()
    .expect(Selector('.error-msg').innerText)
    .eql('Field can not be empty')
    .switchToMainWindow()
    .switchToIframe(expirationYearIframe)
    .expect(Selector('.error-msg').visible)
    .ok()
    .expect(Selector('.error-msg').innerText)
    .eql('Field can not be empty')
    .switchToMainWindow()
    .switchToIframe(cvcIframe)
    .expect(Selector('.error-msg').visible)
    .ok()
    .expect(Selector('.error-msg').innerText)
    .eql('Field can not be empty');
});
