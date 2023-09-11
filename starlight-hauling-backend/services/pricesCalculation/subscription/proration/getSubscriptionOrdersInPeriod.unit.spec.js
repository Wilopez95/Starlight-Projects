import round from 'lodash/round.js';
import getSubscriptionOrdersInPeriod from './getSubscriptionOrdersInPeriod.js';

describe('getSubscriptionOrdersInPeriod', () => {
  const subscriptionOrders = [
    {
      serviceDate: new Date('2021-08-14T06:00:00.000Z'),
      price: '122.761756',
      quantity: 1,
    },
    {
      serviceDate: new Date('2021-08-28T06:00:00.000Z'),
      price: 53.123845,
      quantity: 2,
    },
  ];

  test('should return default values if input is undefined or empty', () => {
    expect(getSubscriptionOrdersInPeriod()).toMatchInlineSnapshot(`
            Object {
              "subscriptionOrdersInPeriod": Array [],
              "subscriptionOrdersTotal": 0,
            }
        `);

    expect(getSubscriptionOrdersInPeriod({})).toMatchInlineSnapshot(`
            Object {
              "subscriptionOrdersInPeriod": Array [],
              "subscriptionOrdersTotal": 0,
            }
        `);
  });

  test('should return default values if some parameters are missing', () => {
    expect(getSubscriptionOrdersInPeriod({ subscriptionOrders })).toMatchInlineSnapshot(`
            Object {
              "subscriptionOrdersInPeriod": Array [],
              "subscriptionOrdersTotal": 0,
            }
        `);
  });

  test('should include services if service date is within a date range', () => {
    const { subscriptionOrdersTotal, subscriptionOrdersInPeriod } = getSubscriptionOrdersInPeriod({
      periodFrom: new Date('2021-08-10T06:00:00.000Z'),
      periodTo: new Date('2021-08-31T06:00:00.000Z'),
      subscriptionOrders,
    });

    expect(round(subscriptionOrdersTotal, 6)).toStrictEqual(229.009446);
    expect(subscriptionOrdersInPeriod).toMatchInlineSnapshot(`
            Array [
              Object {
                "price": 122.761756,
                "quantity": 1,
                "serviceDate": 2021-08-14T06:00:00.000Z,
                "totalPrice": 122.761756,
              },
              Object {
                "price": 53.123845,
                "quantity": 2,
                "serviceDate": 2021-08-28T06:00:00.000Z,
                "totalPrice": 106.24769,
              },
            ]
        `);
  });

  test('should filter out services if service date is not within a date range', () => {
    const { subscriptionOrdersTotal, subscriptionOrdersInPeriod } = getSubscriptionOrdersInPeriod({
      periodFrom: new Date('2021-08-20T06:00:00.000Z'),
      periodTo: new Date('2021-08-31T06:00:00.000Z'),
      subscriptionOrders,
    });

    expect(round(subscriptionOrdersTotal, 6)).toStrictEqual(106.24769);
    expect(subscriptionOrdersInPeriod).toMatchInlineSnapshot(`
            Array [
              Object {
                "price": 53.123845,
                "quantity": 2,
                "serviceDate": 2021-08-28T06:00:00.000Z,
                "totalPrice": 106.24769,
              },
            ]
        `);
  });
});
