import { BillableItemActionEnum } from '@root/consts';
import { updateSubscriptionOrderQuantityIfNeeded } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/sections/ServiceItems/components/ServiceItem/hooks/useSubscriptionOrdersWithServiceItemSynchronizer/helpers';
import { getNewSubscriptionOrderMock } from '@tests/__mocks__';

describe('updateSubscriptionOrderQuantityIfNeeded', () => {
  test('should do nothing when subscription order quantity equals to service item quantity', () => {
    const result = updateSubscriptionOrderQuantityIfNeeded({
      isSubscriptionDraftEdit: false,
      initialServiceItemQuantity: 0,
      serviceItemQuantity: 3,
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            quantity: 3,
          },
        ],
        optionalSubscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            quantity: 3,
          },
        ],
      },
    });

    expect(result.subscriptionOrders[0].quantity).toBe(3);
    expect(result.optionalSubscriptionOrders[0].quantity).toBe(3);
  });

  test('should increase new subscription order quantity when service quantity is increased', () => {
    const result = updateSubscriptionOrderQuantityIfNeeded({
      isSubscriptionDraftEdit: false,
      initialServiceItemQuantity: 0,
      serviceItemQuantity: 3,
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            quantity: 2,
          },
        ],
        optionalSubscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            quantity: 2,
          },
        ],
      },
    });

    expect(result.subscriptionOrders[0].quantity).toBe(3);
    expect(result.optionalSubscriptionOrders[0].quantity).toBe(3);
  });

  test('should increase new subscription order quantity when service quantity is decreased', () => {
    const result = updateSubscriptionOrderQuantityIfNeeded({
      isSubscriptionDraftEdit: false,
      initialServiceItemQuantity: 0,
      serviceItemQuantity: 2,
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            quantity: 3,
          },
        ],
        optionalSubscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            quantity: 3,
          },
        ],
      },
    });

    expect(result.subscriptionOrders[0].quantity).toBe(2);
    expect(result.optionalSubscriptionOrders[0].quantity).toBe(2);
  });

  test('should do nothing with saved subscription order when service quantity is changed', () => {
    const result = updateSubscriptionOrderQuantityIfNeeded({
      isSubscriptionDraftEdit: false,
      initialServiceItemQuantity: 2,
      serviceItemQuantity: 4,
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 1,
            quantity: 2,
            action: BillableItemActionEnum.delivery,
          },
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            quantity: 1,
            action: BillableItemActionEnum.delivery,
          },
        ],
        optionalSubscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 1,
            quantity: 2,
            action: BillableItemActionEnum.delivery,
          },
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            quantity: 1,
            action: BillableItemActionEnum.delivery,
          },
        ],
      },
    });

    expect(result.subscriptionOrders[0].quantity).toBe(2);
    expect(result.optionalSubscriptionOrders[0].quantity).toBe(2);
  });

  test('should increase saved subscription order quantity when draft service quantity is increased', () => {
    const result = updateSubscriptionOrderQuantityIfNeeded({
      isSubscriptionDraftEdit: true,
      initialServiceItemQuantity: 1,
      serviceItemQuantity: 3,
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 1,
            quantity: 2,
          },
        ],
        optionalSubscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 1,
            quantity: 2,
          },
        ],
      },
    });

    expect(result.subscriptionOrders.length).toBe(1);
    expect(result.subscriptionOrders[0].quantity).toBe(3);
    expect(result.optionalSubscriptionOrders.length).toBe(1);
    expect(result.optionalSubscriptionOrders[0].quantity).toBe(3);
  });

  test('should decrease saved subscription order quantity when draft service quantity is decreased', () => {
    const result = updateSubscriptionOrderQuantityIfNeeded({
      isSubscriptionDraftEdit: true,
      initialServiceItemQuantity: 1,
      serviceItemQuantity: 2,
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 1,
            quantity: 3,
          },
        ],
        optionalSubscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 1,
            quantity: 3,
          },
        ],
      },
    });

    expect(result.subscriptionOrders.length).toBe(1);
    expect(result.subscriptionOrders[0].quantity).toBe(2);
    expect(result.optionalSubscriptionOrders.length).toBe(1);
    expect(result.optionalSubscriptionOrders[0].quantity).toBe(2);
  });

  test('should sync "final for service subscription order" quantity when service quantity is changed', () => {
    const result = updateSubscriptionOrderQuantityIfNeeded({
      isSubscriptionDraftEdit: false,
      initialServiceItemQuantity: 1,
      serviceItemQuantity: 3,
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            quantity: 2,
            isFinalForService: true,
          },
        ],
        optionalSubscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            quantity: 2,
            isFinalForService: true,
          },
        ],
      },
    });

    expect(result.subscriptionOrders[0].quantity).toBe(3);
    expect(result.optionalSubscriptionOrders[0].quantity).toBe(3);
  });

  test('should sync saved "final for service subscription order" when service quantity is changed', () => {
    const result = updateSubscriptionOrderQuantityIfNeeded({
      isSubscriptionDraftEdit: false,
      initialServiceItemQuantity: 1,
      serviceItemQuantity: 3,
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 1,
            quantity: 2,
            isFinalForService: true,
          },
        ],
        optionalSubscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 1,
            quantity: 2,
            isFinalForService: true,
          },
        ],
      },
    });

    expect(result.subscriptionOrders[0].quantity).toBe(3);
    expect(result.optionalSubscriptionOrders[0].quantity).toBe(3);
  });

  test('should do nothing with "final for service subscription order" when service quantity is unchanged', () => {
    const result = updateSubscriptionOrderQuantityIfNeeded({
      isSubscriptionDraftEdit: false,
      initialServiceItemQuantity: 1,
      serviceItemQuantity: 3,
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 1,
            quantity: 3,
            isFinalForService: true,
          },
        ],
        optionalSubscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 1,
            quantity: 3,
            isFinalForService: true,
          },
        ],
      },
    });

    expect(result.subscriptionOrders[0].quantity).toBe(3);
    expect(result.optionalSubscriptionOrders[0].quantity).toBe(3);
  });
});
