import { BillableItemActionEnum } from '@root/consts';
import { getNewSubscriptionOrderMock } from '@tests/__mocks__';

import { removeInvalidSubscriptionOrderIfNeeded } from '../removeInvalidSubscriptionOrderIfNeeded';

describe('removeInvalidSubscriptionOrderIfNeeded', () => {
  test("should remove new subscription order when action doesn't match with needed", () => {
    const result = removeInvalidSubscriptionOrderIfNeeded(
      {
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            action: BillableItemActionEnum.final,
          },
        ],
        optionalSubscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            action: BillableItemActionEnum.final,
          },
        ],
      },
      BillableItemActionEnum.delivery,
    );

    expect(result.subscriptionOrders.length).toBe(0);
    expect(result.optionalSubscriptionOrders.length).toBe(0);
  });

  test("should do nothing with 'final for service subscription order' when action doesn't match with needed", () => {
    const result = removeInvalidSubscriptionOrderIfNeeded(
      {
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            action: BillableItemActionEnum.final,
            isFinalForService: true,
          },
        ],
        optionalSubscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            action: BillableItemActionEnum.final,
            isFinalForService: true,
          },
        ],
      },
      BillableItemActionEnum.delivery,
    );

    expect(result.subscriptionOrders.length).toBe(1);
    expect(result.subscriptionOrders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          isFinalForService: true,
        }),
      ]),
    );
    expect(result.optionalSubscriptionOrders.length).toBe(1);
    expect(result.optionalSubscriptionOrders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          isFinalForService: true,
        }),
      ]),
    );
  });

  test('should do nothing with saved subscription order', () => {
    const result = removeInvalidSubscriptionOrderIfNeeded(
      {
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 1,
            action: BillableItemActionEnum.delivery,
          },
        ],
        optionalSubscriptionOrders: [],
      },
      BillableItemActionEnum.delivery,
    );

    expect(result.subscriptionOrders.length).toBe(1);
    expect(result.subscriptionOrders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
        }),
      ]),
    );
  });
});
