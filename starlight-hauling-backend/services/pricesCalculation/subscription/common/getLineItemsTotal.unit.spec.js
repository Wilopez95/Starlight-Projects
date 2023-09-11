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

  test('should return 0 if input has no price or quantity', () => {
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

  test('should return calculated sum if input has price and quantity', () => {
    const input = [
      {
        lineItems: [
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
    expect(getLineItemsTotal(input)).toStrictEqual(110);
  });

  test('should return calculated sum if input has decimal price and quantity', () => {
    const input = [
      {
        lineItems: [
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
    expect(getLineItemsTotal(input)).toStrictEqual(145.654313);
  });
});
