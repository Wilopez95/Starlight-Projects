import getProratedTotalForBillingPeriod from './getProratedTotalForBillingPeriod.js';

describe('getProratedTotalForBillingPeriod', () => {
  test('should return 0 if input is undefined', () => {
    expect(getProratedTotalForBillingPeriod()).toStrictEqual(0);
  });

  test('should return 0 if input is empty', () => {
    expect(getProratedTotalForBillingPeriod([])).toStrictEqual(0);
    expect(getProratedTotalForBillingPeriod([[]])).toStrictEqual(0);
    expect(getProratedTotalForBillingPeriod([[{}]])).toStrictEqual(0);
  });

  test('should add 0 if input has no totalPrice or proratedTotal', () => {
    const input = [
      [
        {
          subscriptionOrders: [
            {
              totalPrice: 5,
            },
            {},
          ],
          serviceItemProrationInfo: {},
          lineItemsProrationInfo: [
            {
              proratedTotal: 238.45,
            },
          ],
        },
        {
          subscriptionOrders: [
            {
              totalPrice: 5,
            },
            {
              totalPrice: 5,
            },
          ],
          serviceItemProrationInfo: {
            proratedTotal: 68.13,
          },
          lineItemsProrationInfo: [{}],
        },
      ],
    ];
    expect(getProratedTotalForBillingPeriod(input)).toStrictEqual(321.58);
  });

  test('should return calculated sum', () => {
    const input = [
      [
        {
          subscriptionOrders: [
            {
              totalPrice: 5,
            },
            {
              totalPrice: 5,
            },
          ],
          serviceItemProrationInfo: {
            proratedTotal: 68.134368,
          },
          lineItemsProrationInfo: [
            {
              proratedTotal: 238.4545,
            },
          ],
        },
        {
          subscriptionOrders: [
            {
              totalPrice: 5,
            },
            {
              totalPrice: 5,
            },
          ],
          serviceItemProrationInfo: {
            proratedTotal: 68.13,
          },
          lineItemsProrationInfo: [
            {
              proratedTotal: 238.457,
            },
          ],
        },
      ],
    ];
    expect(getProratedTotalForBillingPeriod(input)).toStrictEqual(633.175868);
  });
});
