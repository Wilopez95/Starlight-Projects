import getSubscriptionOrdersTotal from './getSubscriptionOrdersTotal.js';

describe('getSubscriptionOrdersTotal', () => {
  test('should return 0 if input is undefined', () => {
    expect(getSubscriptionOrdersTotal()).toStrictEqual(0);
    expect(getSubscriptionOrdersTotal([{}])).toStrictEqual(0);
  });

  test('should return 0 if input is empty', () => {
    expect(getSubscriptionOrdersTotal([])).toStrictEqual(0);
    expect(getSubscriptionOrdersTotal([{ subscriptionOrders: [] }])).toStrictEqual(0);
  });

  test('should return 0 if input has no price or quantity', () => {
    const input = [
      {
        subscriptionOrders: [
          {},
          {
            price: 11,
          },
          {
            quantity: 4,
          },
        ],
      },
    ];
    expect(getSubscriptionOrdersTotal(input)).toStrictEqual(0);
  });

  test('should return calculated sum if input has price and quantity', () => {
    const input = [
      {
        subscriptionOrders: [
          {},
          {
            price: 11,
            quantity: 4,
          },
          {
            price: 22,
            quantity: 3,
          },
        ],
      },
    ];
    expect(getSubscriptionOrdersTotal(input)).toStrictEqual(110);
  });

  test('should return calculated sum if input has decimal price and quantity', () => {
    const input = [
      {
        subscriptionOrders: [
          {},
          {
            price: 11.123456,
            quantity: 3,
          },
          {
            price: 22.456789,
            quantity: 5,
          },
        ],
      },
    ];
    expect(getSubscriptionOrdersTotal(input)).toStrictEqual(145.654313);
  });
});
