import round from 'lodash/round.js';
import getRecurringTaxesTotal from './getRecurringTaxesTotal.js';

describe('getRecurringTaxesTotal', () => {
  test('should return 0 if input is undefined', () => {
    expect(getRecurringTaxesTotal()).toStrictEqual(0);
  });

  test('should return 0 if input is empty', () => {
    expect(getRecurringTaxesTotal([])).toStrictEqual(0);
    expect(getRecurringTaxesTotal([{}])).toStrictEqual(0);
  });

  test('should add 0 if input has no calculatedTax', () => {
    const input = [
      {
        appliedTaxes: [
          [
            {
              calculatedTax: 10,
            },
          ],
          [
            {
              calculatedTax: 6,
            },
            {},
          ],
        ],
        lineItems: [
          {
            appliedTaxes: [
              [
                {
                  calculatedTax: 20,
                },
              ],
              [{}],
            ],
          },
        ],
      },
      {
        appliedTaxes: [
          [],
          [
            {
              calculatedTax: 20,
            },
          ],
        ],
        lineItems: [{ appliedTaxes: [[], []] }],
      },
    ];
    expect(getRecurringTaxesTotal(input)).toStrictEqual(56);
  });

  test('should return calculated sum', () => {
    const input = [
      {
        appliedTaxes: [
          [
            {
              calculatedTax: 10.746789,
            },
          ],
          [
            {
              calculatedTax: 6,
            },
            {
              calculatedTax: 20.3435,
            },
          ],
        ],
        lineItems: [
          {
            appliedTaxes: [
              [
                {
                  calculatedTax: 20,
                },
              ],
              [
                {
                  calculatedTax: 23.345,
                },
              ],
            ],
          },
        ],
      },
      {
        appliedTaxes: [
          [],
          [
            {
              calculatedTax: 20,
            },
          ],
        ],
        lineItems: [{ appliedTaxes: [[], []] }],
      },
    ];
    expect(round(getRecurringTaxesTotal(input), 6)).toStrictEqual(100.435289);
  });

  test('should not add orders to calculated sum', () => {
    const input = [
      {
        appliedTaxes: [
          [
            {
              calculatedTax: 10.746789,
            },
          ],
          [
            {
              calculatedTax: 6,
            },
            {
              calculatedTax: 20.3435,
            },
          ],
        ],
        lineItems: [
          {
            appliedTaxes: [
              [
                {
                  calculatedTax: 20,
                },
              ],
              [
                {
                  calculatedTax: 23.345,
                },
              ],
            ],
          },
        ],
        subscriptionOrders: [
          {
            appliedTaxes: [
              [
                {
                  calculatedTax: 0.252111,
                },
              ],
              [
                {
                  calculatedTax: 0.05,
                },
                {
                  calculatedTax: 20,
                },
              ],
            ],
          },
          {
            appliedTaxes: [
              [
                {
                  calculatedTax: 0.251356,
                },
              ],
              [
                {
                  calculatedTax: 0.1,
                },
                {
                  calculatedTax: 20,
                },
              ],
            ],
          },
        ],
      },
      {
        appliedTaxes: [
          [],
          [
            {
              calculatedTax: 20,
            },
          ],
        ],
        lineItems: [{ appliedTaxes: [[], []] }],
        subscriptionOrders: [
          {
            appliedTaxes: [
              [
                {
                  calculatedTax: 0.25,
                },
              ],
              [
                {
                  calculatedTax: 0.050504,
                },
                {
                  calculatedTax: 20,
                },
              ],
            ],
          },
          {
            appliedTaxes: [
              [
                {
                  calculatedTax: 0.25,
                },
              ],
              [
                {
                  calculatedTax: 0.11111,
                },
                {
                  calculatedTax: 20,
                },
              ],
            ],
          },
        ],
      },
    ];
    expect(round(getRecurringTaxesTotal(input), 6)).toStrictEqual(100.435289);
  });
});
