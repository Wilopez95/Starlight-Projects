import {
  isRecurringServicePriceIncluded,
  isOneTimeServicePriceIncluded,
} from './serviceInclusions.js';

const billableServiceInclusions = {
  1234: [123, 456, 789, 5678],
  5678: [987, 654, 321],
};

describe('serviceInclusions -> isRecurringServicePriceIncluded', () => {
  test('should return true if recurring services is included', () => {
    expect(isRecurringServicePriceIncluded(5678, billableServiceInclusions)).toStrictEqual(true);
  });

  test('should return false if recurring services is not included', () => {
    expect(isRecurringServicePriceIncluded(1234, billableServiceInclusions)).toStrictEqual(false);

    expect(isRecurringServicePriceIncluded(9632, billableServiceInclusions)).toStrictEqual(false);
  });

  test('should return false if some parameters are missed', () => {
    expect(isRecurringServicePriceIncluded(1234)).toStrictEqual(false);
    expect(isRecurringServicePriceIncluded()).toStrictEqual(false);
  });
});

describe('serviceInclusions -> isOneTimeServicePriceIncluded', () => {
  test('should return true if service is included', () => {
    const result = isOneTimeServicePriceIncluded({
      billableServiceId: 456,
      parentBillableServiceId: 1234,
      billableServiceInclusions,
    });

    expect(result).toStrictEqual(true);
  });

  test('should return false if service is not included into its parent service', () => {
    const result = isOneTimeServicePriceIncluded({
      billableServiceId: 456,
      parentBillableServiceId: 5678,
      billableServiceInclusions,
    });

    expect(result).toStrictEqual(false);
  });

  test('should return false if service is not included in any parent service', () => {
    const result = isOneTimeServicePriceIncluded({
      billableServiceId: 963,
      parentBillableServiceId: 5678,
      billableServiceInclusions,
    });

    expect(result).toStrictEqual(false);
  });

  test('should return false if some parameters are missed', () => {
    expect(
      isOneTimeServicePriceIncluded({
        billableServiceId: 456,
        parentBillableServiceId: 1234,
      }),
    ).toStrictEqual(false);

    expect(
      isOneTimeServicePriceIncluded({
        billableServiceId: 456,
        billableServiceInclusions,
      }),
    ).toStrictEqual(false);

    expect(
      isOneTimeServicePriceIncluded({
        parentBillableServiceId: 1234,
        billableServiceInclusions,
      }),
    ).toStrictEqual(false);

    expect(
      isOneTimeServicePriceIncluded({
        billableServiceId: 456,
      }),
    ).toStrictEqual(false);

    expect(
      isOneTimeServicePriceIncluded({
        billableServiceInclusions,
      }),
    ).toStrictEqual(false);

    expect(
      isOneTimeServicePriceIncluded({
        parentBillableServiceId: 1234,
      }),
    ).toStrictEqual(false);

    expect(isOneTimeServicePriceIncluded({})).toStrictEqual(false);

    expect(isOneTimeServicePriceIncluded()).toStrictEqual(false);
  });
});
