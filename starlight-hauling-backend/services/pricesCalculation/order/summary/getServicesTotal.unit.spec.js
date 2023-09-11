import getServicesTotal from './getServicesTotal.js';

describe('getServicesTotal', () => {
  test('should return 0 if input is undefined', () => {
    expect(getServicesTotal()).toStrictEqual(0);
  });

  test('should return 0 if input is empty', () => {
    expect(getServicesTotal([])).toStrictEqual(0);
  });

  test('should return 0 if input has no totals', () => {
    const input = [
      {},
      {
        price: 11,
      },
      {
        quantity: 4,
      },
    ];
    expect(getServicesTotal(input)).toStrictEqual(0);
  });

  test('should return 0 if input totals are null', () => {
    const input = [
      {},
      {
        total: null,
      },
      {
        total: null,
      },
    ];
    expect(getServicesTotal(input)).toStrictEqual(0);
  });

  test('should return calculated sum if input has totals', () => {
    const input = [
      {},
      {
        total: 11111111111111,
      },
      {
        total: 22222222222222,
      },
    ];
    expect(getServicesTotal(input)).toStrictEqual(33333333333333);
  });
});
