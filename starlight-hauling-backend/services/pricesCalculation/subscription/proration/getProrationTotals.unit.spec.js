import { PRORATION_TYPE } from '../../../../consts/prorationTypes.js';
import { BILLING_CYCLE } from '../../../../consts/billingCycles.js';
import { FREQUENCY_TYPE } from '../../../../consts/frequencyTypes.js';
import getProrationTotals from './getProrationTotals.js';

describe('getProrationTotals -> calculated prorated total -> new item', () => {
  test('daily billing cycle, changes are effective', () => {
    const result = getProrationTotals({
      itemId: null,
      price: 987.189875,
      quantity: 5,
      billingCycle: BILLING_CYCLE.daily,
      effectiveDate: new Date('2021-08-05T06:00:00.000Z'),
      nextBillingPeriodFrom: new Date('2021-08-05T06:00:00.000Z'),
      nextBillingPeriodTo: new Date('2021-08-05T06:00:00.000Z'),
      periodFrom: new Date('2021-08-05T06:00:00.000Z'),
      periodTo: new Date('2021-08-05T06:00:00.000Z'),
      isLastProrationPeriodInBillingCycle: false,
      prevProrationEffectiveDate: null,
      prevProrationEffectivePrice: null,
      prevProrationOverride: false,
    });

    expect(result).toMatchInlineSnapshot(`
Object {
  "price": 987.189875,
  "proratedTotal": 4935.949375,
  "quantity": 5,
  "totalDay": 1,
  "totalPrice": 4935.949375,
  "usageDay": 1,
}
`);
  });

  test('monthly billing cycle, proration for services performed, changes are effective, every 3 days', () => {
    const result = getProrationTotals({
      itemId: null,
      price: 987.189875,
      quantity: 5,
      billingCycle: BILLING_CYCLE.monthly,
      prorationType: PRORATION_TYPE.servicesPerformed,
      frequencyType: FREQUENCY_TYPE.everyXDays,
      frequencyTimes: 3,
      effectiveDate: new Date('2021-08-05T06:00:00.000Z'),
      nextBillingPeriodFrom: new Date('2021-08-01T06:00:00.000Z'),
      nextBillingPeriodTo: new Date('2021-08-31T06:00:00.000Z'),
      periodFrom: new Date('2021-08-05T06:00:00.000Z'),
      periodTo: new Date('2021-08-15T06:00:00.000Z'),
      isLastProrationPeriodInBillingCycle: false,
      prevProrationEffectiveDate: null,
      prevProrationEffectivePrice: null,
      prevProrationOverride: false,
    });

    expect(result).toMatchInlineSnapshot(`
Object {
  "price": 987.189875,
  "proratedTotal": 1480.7848125,
  "quantity": 5,
  "totalDay": 10,
  "totalPrice": 4935.949375,
  "usageDay": 3,
}
`);
  });

  test('monthly billing cycle, proration for services performed, changes are effective, 2 times per week', () => {
    const result = getProrationTotals({
      itemId: null,
      price: 987.189875,
      quantity: 5,
      billingCycle: BILLING_CYCLE.monthly,
      prorationType: PRORATION_TYPE.servicesPerformed,
      frequencyType: FREQUENCY_TYPE.xPerWeek,
      serviceDaysOfWeek: {
        1: {},
        4: {},
      },
      effectiveDate: new Date('2021-08-05T06:00:00.000Z'),
      nextBillingPeriodFrom: new Date('2021-08-01T06:00:00.000Z'),
      nextBillingPeriodTo: new Date('2021-08-31T06:00:00.000Z'),
      periodFrom: new Date('2021-08-05T06:00:00.000Z'),
      periodTo: new Date('2021-08-15T06:00:00.000Z'),
      isLastProrationPeriodInBillingCycle: false,
      prevProrationEffectiveDate: null,
      prevProrationEffectivePrice: null,
      prevProrationOverride: false,
    });

    expect(result).toMatchInlineSnapshot(`
Object {
  "price": 987.189875,
  "proratedTotal": 1645.3164583333332,
  "quantity": 5,
  "totalDay": 9,
  "totalPrice": 4935.949375,
  "usageDay": 3,
}
`);
  });

  test('monthly billing cycle, proration for usage days, changes are effective', () => {
    const result = getProrationTotals({
      itemId: null,
      price: 987.189875,
      quantity: 5,
      billingCycle: BILLING_CYCLE.monthly,
      prorationType: PRORATION_TYPE.usageDays,
      effectiveDate: new Date('2021-08-05T06:00:00.000Z'),
      nextBillingPeriodFrom: new Date('2021-08-01T06:00:00.000Z'),
      nextBillingPeriodTo: new Date('2021-08-31T06:00:00.000Z'),
      periodFrom: new Date('2021-08-05T06:00:00.000Z'),
      periodTo: new Date('2021-08-15T06:00:00.000Z'),
      isLastProrationPeriodInBillingCycle: false,
      prevProrationEffectiveDate: null,
      prevProrationEffectivePrice: null,
      prevProrationOverride: false,
    });

    expect(result).toMatchInlineSnapshot(`
Object {
  "price": 987.189875,
  "proratedTotal": 1751.4659072580646,
  "quantity": 5,
  "totalDay": 31,
  "totalPrice": 4935.949375,
  "usageDay": 11,
}
`);
  });

  test('monthly billing cycle, proration for usage days, changes are not effective', () => {
    const result = getProrationTotals({
      itemId: null,
      price: 987.189875,
      quantity: 5,
      billingCycle: BILLING_CYCLE.monthly,
      prorationType: PRORATION_TYPE.usageDays,
      effectiveDate: new Date('2021-08-16T06:00:00.000Z'),
      nextBillingPeriodFrom: new Date('2021-08-01T06:00:00.000Z'),
      nextBillingPeriodTo: new Date('2021-08-31T06:00:00.000Z'),
      periodFrom: new Date('2021-08-05T06:00:00.000Z'),
      periodTo: new Date('2021-08-15T06:00:00.000Z'),
      isLastProrationPeriodInBillingCycle: false,
      prevProrationEffectiveDate: null,
      prevProrationEffectivePrice: null,
      prevProrationOverride: false,
    });

    expect(result).toMatchInlineSnapshot(`
Object {
  "price": 987.189875,
  "proratedTotal": 0,
  "quantity": 5,
  "totalDay": 31,
  "totalPrice": 4935.949375,
  "usageDay": 0,
}
`);
  });
});

describe('getProrationTotals -> calculated prorated total -> existing item', () => {
  test('monthly billing cycle, proration for usage days, changes are not effective', () => {
    const result = getProrationTotals({
      itemId: 123,
      price: 987.189875,
      quantity: 5,
      prevQuantity: 10,
      billingCycle: BILLING_CYCLE.monthly,
      prorationType: PRORATION_TYPE.usageDays,
      effectiveDate: new Date('2021-08-16T06:00:00.000Z'),
      nextBillingPeriodFrom: new Date('2021-08-01T06:00:00.000Z'),
      nextBillingPeriodTo: new Date('2021-08-31T06:00:00.000Z'),
      periodFrom: new Date('2021-08-05T06:00:00.000Z'),
      periodTo: new Date('2021-08-15T06:00:00.000Z'),
      isLastProrationPeriodInBillingCycle: false,
      prevProrationEffectiveDate: null,
      prevProrationEffectivePrice: null,
      prevProrationOverride: false,
    });

    expect(result).toMatchInlineSnapshot(`
Object {
  "price": 987.189875,
  "proratedTotal": 0,
  "quantity": 10,
  "totalDay": 31,
  "totalPrice": 9871.89875,
  "usageDay": 0,
}
`);
  });
});

describe('getProrationTotals -> overridden prorated total', () => {
  test('should return prorated total = null for not the last period in billing cycle', () => {
    const result = getProrationTotals({
      nextBillingPeriodFrom: new Date('2021-08-01T06:00:00.000Z'),
      nextBillingPeriodTo: new Date('2021-08-31T06:00:00.000Z'),
      isLastProrationPeriodInBillingCycle: false,
      prevProrationEffectiveDate: new Date('2021-08-15T06:00:00.000Z'),
      prevProrationEffectivePrice: 453.69,
      prevProrationOverride: true,
    });

    expect(result).toMatchInlineSnapshot(`
            Object {
              "price": null,
              "proratedTotal": null,
              "quantity": null,
              "totalDay": null,
              "totalPrice": null,
              "usageDay": null,
            }
        `);
  });

  test('should return prorated total for the last period in billing cycle', () => {
    const result = getProrationTotals({
      nextBillingPeriodFrom: new Date('2021-08-01T06:00:00.000Z'),
      nextBillingPeriodTo: new Date('2021-08-31T06:00:00.000Z'),
      isLastProrationPeriodInBillingCycle: true,
      prevProrationEffectiveDate: new Date('2021-08-15T06:00:00.000Z'),
      prevProrationEffectivePrice: 453.69,
      prevProrationOverride: true,
    });

    expect(result).toMatchInlineSnapshot(`
            Object {
              "price": null,
              "proratedTotal": 453.69,
              "quantity": null,
              "totalDay": null,
              "totalPrice": null,
              "usageDay": null,
            }
        `);
  });
});
