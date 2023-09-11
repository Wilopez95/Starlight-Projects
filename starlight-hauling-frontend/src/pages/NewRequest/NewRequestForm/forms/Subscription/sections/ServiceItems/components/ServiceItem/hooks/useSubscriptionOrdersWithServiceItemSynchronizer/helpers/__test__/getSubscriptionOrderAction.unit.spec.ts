import { getNewServiceItemMock } from '@tests/__mocks__';

import { getSubscriptionOrderAction } from '../getSubscriptionOrderAction';

describe('getSubscriptionOrderAction', () => {
  test('should return `delivery` when there is no `initialServiceItem`', () => {
    const result = getSubscriptionOrderAction(1, undefined);

    expect(result).toBe('delivery');
  });

  test('should return `delivery` when `initialServiceItem` is new', () => {
    const result = getSubscriptionOrderAction(1, {
      ...getNewServiceItemMock(),
      id: 0,
    });

    expect(result).toBe('delivery');
  });

  test('should return `delivery` when service quantity increased', () => {
    const result = getSubscriptionOrderAction(2, {
      ...getNewServiceItemMock(),
      quantity: 1,
    });

    expect(result).toBe('delivery');
  });

  test('should return `final` when service quantity decreased', () => {
    const result = getSubscriptionOrderAction(1, {
      ...getNewServiceItemMock(),
      quantity: 2,
    });

    expect(result).toBe('final');
  });

  test('should return `null` when service quantity is unchanged', () => {
    const result = getSubscriptionOrderAction(1, {
      ...getNewServiceItemMock(),
      quantity: 1,
    });

    expect(result).toBe(null);
  });
});
