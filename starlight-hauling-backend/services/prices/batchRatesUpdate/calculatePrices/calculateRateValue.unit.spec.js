import calculateRateValue from './calculateRateValue.js';

describe('calculateRateValue', () => {
  test('flat increase ', () => {
    const result = calculateRateValue({ basePrice: 10000000, calculation: 'flat', value: 10 });

    expect(result).toStrictEqual(20000000);
  });

  test('flat decrease', () => {
    const result = calculateRateValue({
      basePrice: '25349000',
      calculation: 'flat',
      value: -13.64,
    });

    expect(result).toStrictEqual(11709000);
  });

  test('flat decrease to NaN', () => {
    const result = calculateRateValue({
      basePrice: 42,
      calculation: 'flat',
      value: -245.45,
    });

    expect(result).toBeNaN();
  });

  test('percentage increase', () => {
    const result = calculateRateValue({
      basePrice: 100e6,
      calculation: 'percentage',
      value: 12,
    });

    expect(result).toStrictEqual(112e6);
  });

  test('percentage decrease to Nan', () => {
    const result = calculateRateValue({
      basePrice: 4e6,
      calculation: 'percentage',
      value: 80,
    });

    expect(result).toStrictEqual(72e5);
  });

  test('percentage decrease', () => {
    const result = calculateRateValue({
      basePrice: 4200000,
      calculation: 'percentage',
      value: -94.45,
    });

    expect(result).toStrictEqual(233100);
  });

  test('percentage decrease to Nan', () => {
    const result = calculateRateValue({
      basePrice: 42,
      calculation: 'percentage',
      value: -121.1,
    });

    expect(result).toBeNaN();
  });

  test('flat decrease to 0', () => {
    const result = calculateRateValue({
      basePrice: 42000000,
      calculation: 'flat',
      value: -42,
    });

    expect(result).toStrictEqual(0);
  });
});
