import getLineItemsTotal from './getLineItemsTotal.js';

describe('getLineItemsTotal', () => {
  test('should return 0 if input is undefined', () => {
    expect(getLineItemsTotal()).toStrictEqual(0);
    expect(getLineItemsTotal([{}])).toStrictEqual(0);
  });

  test('should return 0 if input is empty', () => {
    expect(getLineItemsTotal([])).toStrictEqual(0);
    expect(getLineItemsTotal([{ lineItems: [] }])).toStrictEqual(0);
  });

  test('should return 0 if input has no totals or service quantity', () => {
    const input = [
      {
        lineItems: [
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
    expect(getLineItemsTotal(input)).toStrictEqual(0);
  });

  test('should return 0 if input totals are null', () => {
    const input = [
      {
        quantity: 3,
        lineItems: [
          {},
          {
            total: null,
          },
          {
            total: null,
          },
        ],
      },
    ];
    expect(getLineItemsTotal(input)).toStrictEqual(0);
  });

  test('should return calculated sum if input has totals and service quantity', () => {
    const input = [
      {
        quantity: 3,
        lineItems: [
          {},
          {
            total: 11111,
          },
          {
            total: 22222,
          },
        ],
      },
    ];
    expect(getLineItemsTotal(input)).toStrictEqual(99999);
  });
});
