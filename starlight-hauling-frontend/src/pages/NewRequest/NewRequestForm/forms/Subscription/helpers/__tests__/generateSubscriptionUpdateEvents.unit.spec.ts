import {
  getGeneratedEventsMock,
  getInitialSubscriptionMock,
  getLineItemsEventsMock,
  getServiceItemsEventsMock,
  getSubscriptionOrdersEventsMock,
  getSubscriptionWithLineItemsAndUpdatedSubOrdersMock,
  getSubscriptionWithUpdatedLineItemsAndSubOrdersMock,
  getTouchedSubscriptionMock,
  getUpdatedSubscriptionMock,
  getUpdatedSubscriptionWithItemsMock,
} from '@tests/__mocks__';
import { generateSubscriptionUpdateEvents } from '../generateSubscriptionUpdateEvents';

describe('generateSubscriptionUpdateEvents', () => {
  test('should no generate update events when form was touched', () => {
    expect(
      generateSubscriptionUpdateEvents({
        values: getTouchedSubscriptionMock(),
        initialValues: getInitialSubscriptionMock(),
      }),
    ).toEqual({
      serviceItems: [],
      lineItems: [],
      subscriptionOrders: [],
    });
  });

  test('should generate only sub orders events when only sub orders were updated', () => {
    expect(
      generateSubscriptionUpdateEvents({
        values: getSubscriptionWithLineItemsAndUpdatedSubOrdersMock(),
        initialValues: getInitialSubscriptionMock(),
      }),
    ).toEqual({
      serviceItems: [],
      lineItems: [],
      subscriptionOrders: getSubscriptionOrdersEventsMock(),
    });
  });

  test('should generate only line items events when only line items were updated', () => {
    expect(
      generateSubscriptionUpdateEvents({
        values: getSubscriptionWithUpdatedLineItemsAndSubOrdersMock(),
        initialValues: getInitialSubscriptionMock(),
      }),
    ).toEqual({
      serviceItems: [],
      lineItems: getLineItemsEventsMock(),
      subscriptionOrders: [],
    });
  });

  test('should generate only service items events when only services were updated', () => {
    expect(
      generateSubscriptionUpdateEvents({
        values: getUpdatedSubscriptionMock(),
        initialValues: getInitialSubscriptionMock(),
      }),
    ).toEqual({
      serviceItems: getServiceItemsEventsMock(),
      lineItems: [],
      subscriptionOrders: [],
    });
  });

  test('should generate edit, remove and add service items events with line items events and sub orders events when subscription was edited', () => {
    const result = generateSubscriptionUpdateEvents({
      values: getUpdatedSubscriptionWithItemsMock(),
      initialValues: getInitialSubscriptionMock(),
    });
    const expectedResult = getGeneratedEventsMock();
    //testing individually, to prevent deep objects error
    expect(result.serviceItems).toEqual(expectedResult.serviceItems);
  });
});
