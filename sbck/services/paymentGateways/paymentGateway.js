import assert from 'assert';

export class PaymentGateway {
  constructor(ctx, { mid, username, password }) {
    assert.ok(mid, 'Mid is missing on gateway instantiation');
    assert.ok(username, 'Username is missing on gateway instantiation');
    assert.ok(password, 'Password is missing on gateway instantiation');

    this.mid = mid;
    this.username = username;
    this.password = password;
    this.ctx = ctx;
  }

  getCardType(cardNumber) {
    let re = new RegExp('^4');
    if (cardNumber.match(re) != null) {
      return 'VISA';
    }

    // Mastercard
    re = new RegExp('^5[1-5]');
    if (cardNumber.match(re) != null) {
      return 'MC';
    }

    // AMEX
    re = new RegExp('^3[47]');
    if (cardNumber.match(re) != null) {
      return 'AMEX';
    }

    // Discover
    re = new RegExp(
      '^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)',
    );
    if (cardNumber.match(re) != null) {
      return 'DSCV';
    }

    // Diners
    re = new RegExp('^36');
    if (cardNumber.match(re) != null) {
      return 'DNR';
    }

    // JCB
    re = new RegExp('^35(2[89]|[3-8][0-9])');
    if (cardNumber.match(re) != null) {
      return 'JCB';
    }

    return 'UNKNOWN';
  }
}
