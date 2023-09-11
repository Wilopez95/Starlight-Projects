import getProratedRecurringTotalForBillingPeriod from './getProratedRecurringTotalForBillingPeriod.js';

describe('getProratedRecurringTotalForBillingPeriod', () => {
  test('should return 0 if input is undefined', () => {
    expect(getProratedRecurringTotalForBillingPeriod()).toStrictEqual(0);
  });

  test('should return 0 if input is empty', () => {
    expect(getProratedRecurringTotalForBillingPeriod([])).toStrictEqual(0);
    expect(getProratedRecurringTotalForBillingPeriod([[]])).toStrictEqual(0);
    expect(getProratedRecurringTotalForBillingPeriod([[{}]])).toStrictEqual(0);
  });

  test('should add 0 if input has no proratedTotal', () => {
    const input = [
      [
        {
          lineItemsProrationInfo: [
            {
              proratedTotal: 238.45,
            },
          ],
        },
        {
          serviceItemProrationInfo: {
            proratedTotal: 68.13,
          },
        },
      ],
    ];
    expect(getProratedRecurringTotalForBillingPeriod(input)).toStrictEqual(306.58);
  });

  test('should return calculated sum', () => {
    const input = [
      [
        {
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
    expect(getProratedRecurringTotalForBillingPeriod(input)).toStrictEqual(613.175868);
  });

  test('should not add orders to calculated sum', () => {
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
              totalPrice: 50,
            },
            {
              totalPrice: 55,
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
    expect(getProratedRecurringTotalForBillingPeriod(input)).toStrictEqual(613.175868);
  });
});
