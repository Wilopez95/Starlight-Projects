import { renderHook } from '@testing-library/react-hooks';

import { BillableItemActionEnum } from '@root/consts';
import { INewServiceItemSubscriptionOrders } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import {
  getBillableServiceMock,
  getNewServiceItemMock,
  getNewSubscriptionOrderMock,
} from '@tests/__mocks__';

import { ISubscriptionOrderWithServiceItemSynchroniser } from '../types';
import { useSubscriptionOrdersWithServiceItemSynchronizer } from '../useSubscriptionOrdersWithServiceItemSynchronizer';

describe('useSubscriptionOrdersSynchronizer', () => {
  let updateServiceItemSubscriptionOrdersMock: jest.Mock<void, [INewServiceItemSubscriptionOrders]>;

  beforeEach(() => {
    updateServiceItemSubscriptionOrdersMock = jest.fn();
  });

  test('should add subscription order when service quantity is changed', () => {
    const { rerender } = renderHook<ISubscriptionOrderWithServiceItemSynchroniser, void>(
      initialProps => useSubscriptionOrdersWithServiceItemSynchronizer(initialProps),
      {
        initialProps: {
          isSubscriptionDraftEdit: false,
          subscriptionEndDate: undefined,
          serviceItem: {
            ...getNewServiceItemMock(),
            id: 1,
            billableServiceId: 1,
            billableService: getBillableServiceMock(),
            quantity: 1,
            subscriptionOrders: [],
            optionalSubscriptionOrders: [],
          },
          initialServiceItem: undefined,
          billableServices: [],
          updateServiceItemSubscriptionOrders: updateServiceItemSubscriptionOrdersMock,
        },
      },
    );

    rerender({
      isSubscriptionDraftEdit: false,
      subscriptionEndDate: undefined,
      serviceItem: {
        ...getNewServiceItemMock(),
        id: 1,
        billableServiceId: 1,
        billableService: getBillableServiceMock(),
        quantity: 2,
        subscriptionOrders: [],
        optionalSubscriptionOrders: [],
      },
      initialServiceItem: undefined,
      billableServices: [],
      updateServiceItemSubscriptionOrders: updateServiceItemSubscriptionOrdersMock,
    });

    expect(
      updateServiceItemSubscriptionOrdersMock.mock.calls[0][0].optionalSubscriptionOrders.length,
    ).toBe(2);
    expect(
      updateServiceItemSubscriptionOrdersMock.mock.calls[0][0].optionalSubscriptionOrders,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 0,
          action: BillableItemActionEnum.delivery,
        }),
      ]),
    );
  });

  test('should add subscription order with undefined service date when service quantity is changed', () => {
    const { rerender } = renderHook<ISubscriptionOrderWithServiceItemSynchroniser, void>(
      initialProps => useSubscriptionOrdersWithServiceItemSynchronizer(initialProps),
      {
        initialProps: {
          isSubscriptionDraftEdit: false,
          subscriptionEndDate: undefined,
          serviceItem: {
            ...getNewServiceItemMock(),
            id: 1,
            billableServiceId: 1,
            billableService: getBillableServiceMock(),
            quantity: 1,
            subscriptionOrders: [],
            optionalSubscriptionOrders: [],
          },
          initialServiceItem: undefined,
          billableServices: [],
          updateServiceItemSubscriptionOrders: updateServiceItemSubscriptionOrdersMock,
        },
      },
    );

    rerender({
      isSubscriptionDraftEdit: false,
      subscriptionEndDate: undefined,
      serviceItem: {
        ...getNewServiceItemMock(),
        id: 1,
        billableServiceId: 1,
        billableService: getBillableServiceMock(),
        quantity: 2,
        subscriptionOrders: [],
        optionalSubscriptionOrders: [],
      },
      initialServiceItem: undefined,
      billableServices: [],
      updateServiceItemSubscriptionOrders: updateServiceItemSubscriptionOrdersMock,
    });

    expect(
      updateServiceItemSubscriptionOrdersMock.mock.calls[0][0].optionalSubscriptionOrders,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          serviceDate: undefined,
        }),
      ]),
    );
  });

  test('should update new subscription order quantity when service quantity is changed', () => {
    const { rerender } = renderHook<ISubscriptionOrderWithServiceItemSynchroniser, void>(
      initialProps => useSubscriptionOrdersWithServiceItemSynchronizer(initialProps),
      {
        initialProps: {
          isSubscriptionDraftEdit: false,
          subscriptionEndDate: undefined,
          serviceItem: {
            ...getNewServiceItemMock(),
            id: 1,
            billableServiceId: 1,
            billableService: getBillableServiceMock(),
            quantity: 1,
            subscriptionOrders: [
              {
                ...getNewSubscriptionOrderMock(),
                id: 0,
                quantity: 1,
                action: BillableItemActionEnum.delivery,
              },
            ],
            optionalSubscriptionOrders: [],
          },
          initialServiceItem: undefined,
          billableServices: [],
          updateServiceItemSubscriptionOrders: updateServiceItemSubscriptionOrdersMock,
        },
      },
    );

    rerender({
      isSubscriptionDraftEdit: false,
      subscriptionEndDate: undefined,
      serviceItem: {
        ...getNewServiceItemMock(),
        id: 1,
        billableServiceId: 1,
        billableService: getBillableServiceMock(),
        quantity: 2,
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            quantity: 1,
            action: BillableItemActionEnum.delivery,
          },
        ],
        optionalSubscriptionOrders: [],
      },
      initialServiceItem: undefined,
      billableServices: [],
      updateServiceItemSubscriptionOrders: updateServiceItemSubscriptionOrdersMock,
    });

    expect(updateServiceItemSubscriptionOrdersMock.mock.calls[0][0].subscriptionOrders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 0,
          quantity: 2,
        }),
      ]),
    );
  });

  test('should remove new subscription order when service quantity is changed to initial', () => {
    const { rerender } = renderHook<ISubscriptionOrderWithServiceItemSynchroniser, void>(
      initialProps => useSubscriptionOrdersWithServiceItemSynchronizer(initialProps),
      {
        initialProps: {
          isSubscriptionDraftEdit: false,
          subscriptionEndDate: undefined,
          serviceItem: {
            ...getNewServiceItemMock(),
            id: 1,
            billableServiceId: 1,
            billableService: getBillableServiceMock(),
            quantity: 2,
            subscriptionOrders: [
              {
                ...getNewSubscriptionOrderMock(),
                id: 1,
                quantity: 1,
                action: BillableItemActionEnum.delivery,
              },
              {
                ...getNewSubscriptionOrderMock(),
                id: 0,
                quantity: 1,
                action: BillableItemActionEnum.delivery,
              },
            ],
            optionalSubscriptionOrders: [],
          },
          initialServiceItem: {
            ...getNewServiceItemMock(),
            id: 1,
            billableServiceId: 1,
            billableService: getBillableServiceMock(),
            quantity: 1,
            subscriptionOrders: [
              {
                ...getNewSubscriptionOrderMock(),
                id: 0,
                quantity: 1,
                action: BillableItemActionEnum.delivery,
              },
            ],
            optionalSubscriptionOrders: [],
          },
          billableServices: [],
          updateServiceItemSubscriptionOrders: updateServiceItemSubscriptionOrdersMock,
        },
      },
    );

    rerender({
      isSubscriptionDraftEdit: false,
      subscriptionEndDate: undefined,
      serviceItem: {
        ...getNewServiceItemMock(),
        id: 1,
        billableServiceId: 1,
        billableService: getBillableServiceMock(),
        quantity: 1,
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 1,
            quantity: 1,
            action: BillableItemActionEnum.delivery,
          },
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            quantity: 1,
            action: BillableItemActionEnum.delivery,
          },
        ],
        optionalSubscriptionOrders: [],
      },
      initialServiceItem: {
        ...getNewServiceItemMock(),
        id: 1,
        billableServiceId: 1,
        billableService: getBillableServiceMock(),
        quantity: 1,
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            quantity: 1,
            action: BillableItemActionEnum.delivery,
          },
        ],
        optionalSubscriptionOrders: [],
      },
      billableServices: [],
      updateServiceItemSubscriptionOrders: updateServiceItemSubscriptionOrdersMock,
    });

    expect(updateServiceItemSubscriptionOrdersMock.mock.calls[0][0].subscriptionOrders.length).toBe(
      1,
    );
    expect(updateServiceItemSubscriptionOrdersMock.mock.calls[0][0].subscriptionOrders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
        }),
      ]),
    );
  });

  test('should add "final for service subscription order" when subscription end date is selected', () => {
    const { rerender } = renderHook<ISubscriptionOrderWithServiceItemSynchroniser, void>(
      initialProps => useSubscriptionOrdersWithServiceItemSynchronizer(initialProps),
      {
        initialProps: {
          isSubscriptionDraftEdit: false,
          subscriptionEndDate: undefined,
          serviceItem: {
            ...getNewServiceItemMock(),
            id: 1,
            billableServiceId: 1,
            billableService: getBillableServiceMock(),
            quantity: 1,
            subscriptionOrders: [],
            optionalSubscriptionOrders: [],
          },
          initialServiceItem: undefined,
          billableServices: [],
          updateServiceItemSubscriptionOrders: updateServiceItemSubscriptionOrdersMock,
        },
      },
    );

    rerender({
      isSubscriptionDraftEdit: false,
      subscriptionEndDate: new Date('December 1, 2021 00:00:00'),
      serviceItem: {
        ...getNewServiceItemMock(),
        id: 1,
        billableServiceId: 1,
        billableService: getBillableServiceMock(),
        quantity: 1,
        subscriptionOrders: [],
        optionalSubscriptionOrders: [],
      },
      initialServiceItem: undefined,
      billableServices: [],
      updateServiceItemSubscriptionOrders: updateServiceItemSubscriptionOrdersMock,
    });

    expect(
      updateServiceItemSubscriptionOrdersMock.mock.calls[0][0].optionalSubscriptionOrders.length,
    ).toBe(1);
    expect(
      updateServiceItemSubscriptionOrdersMock.mock.calls[0][0].optionalSubscriptionOrders,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 0,
          isFinalForService: true,
        }),
      ]),
    );
  });

  test('should add "final for service subscription order" when subscription end date is selected before service selection', () => {
    const { rerender } = renderHook<ISubscriptionOrderWithServiceItemSynchroniser, void>(
      initialProps => useSubscriptionOrdersWithServiceItemSynchronizer(initialProps),
      {
        initialProps: {
          isSubscriptionDraftEdit: false,
          subscriptionEndDate: new Date('December 1, 2021 00:00:00'),
          serviceItem: {
            ...getNewServiceItemMock(),
            id: 0,
            billableServiceId: 0,
            billableService: getBillableServiceMock(),
            quantity: 1,
            subscriptionOrders: [],
            optionalSubscriptionOrders: [],
          },
          initialServiceItem: undefined,
          billableServices: [],
          updateServiceItemSubscriptionOrders: updateServiceItemSubscriptionOrdersMock,
        },
      },
    );

    rerender({
      isSubscriptionDraftEdit: false,
      subscriptionEndDate: new Date('December 1, 2021 00:00:00'),
      serviceItem: {
        ...getNewServiceItemMock(),
        id: 1,
        billableServiceId: 1,
        billableService: getBillableServiceMock(),
        quantity: 1,
        subscriptionOrders: [],
        optionalSubscriptionOrders: [],
      },
      initialServiceItem: undefined,
      billableServices: [],
      updateServiceItemSubscriptionOrders: updateServiceItemSubscriptionOrdersMock,
    });

    expect(updateServiceItemSubscriptionOrdersMock.mock.calls.length).toBe(1);
    expect(
      updateServiceItemSubscriptionOrdersMock.mock.calls[0][0].optionalSubscriptionOrders,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 0,
          isFinalForService: true,
        }),
      ]),
    );
  });

  test('should add "final for service subscription order" when saved service quantity is zero', () => {
    const { rerender } = renderHook<ISubscriptionOrderWithServiceItemSynchroniser, void>(
      initialProps => useSubscriptionOrdersWithServiceItemSynchronizer(initialProps),
      {
        initialProps: {
          isSubscriptionDraftEdit: false,
          subscriptionEndDate: undefined,
          serviceItem: {
            ...getNewServiceItemMock(),
            id: 1,
            billableServiceId: 1,
            billableService: getBillableServiceMock(),
            quantity: 1,
            subscriptionOrders: [],
            optionalSubscriptionOrders: [],
          },
          initialServiceItem: undefined,
          billableServices: [],
          updateServiceItemSubscriptionOrders: updateServiceItemSubscriptionOrdersMock,
        },
      },
    );

    rerender({
      isSubscriptionDraftEdit: false,
      subscriptionEndDate: undefined,
      serviceItem: {
        ...getNewServiceItemMock(),
        id: 1,
        billableServiceId: 1,
        billableService: getBillableServiceMock(),
        quantity: 0,
        subscriptionOrders: [],
        optionalSubscriptionOrders: [],
      },
      initialServiceItem: undefined,
      billableServices: [],
      updateServiceItemSubscriptionOrders: updateServiceItemSubscriptionOrdersMock,
    });

    expect(
      updateServiceItemSubscriptionOrdersMock.mock.calls[0][0].optionalSubscriptionOrders.length,
    ).toBe(1);
    expect(
      updateServiceItemSubscriptionOrdersMock.mock.calls[0][0].optionalSubscriptionOrders,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 0,
          isFinalForService: true,
        }),
      ]),
    );
  });

  test('should update "final for service subscription order" quantity when service quantity is changed', () => {
    const { rerender } = renderHook<ISubscriptionOrderWithServiceItemSynchroniser, void>(
      initialProps => useSubscriptionOrdersWithServiceItemSynchronizer(initialProps),
      {
        initialProps: {
          isSubscriptionDraftEdit: false,
          subscriptionEndDate: undefined,
          serviceItem: {
            ...getNewServiceItemMock(),
            id: 1,
            billableServiceId: 1,
            billableService: getBillableServiceMock(),
            quantity: 1,
            subscriptionOrders: [],
            optionalSubscriptionOrders: [
              {
                ...getNewSubscriptionOrderMock(),
                id: 0,
                isFinalForService: true,
                action: BillableItemActionEnum.final,
                quantity: 1,
              },
            ],
          },
          initialServiceItem: undefined,
          billableServices: [],
          updateServiceItemSubscriptionOrders: updateServiceItemSubscriptionOrdersMock,
        },
      },
    );

    rerender({
      isSubscriptionDraftEdit: false,
      subscriptionEndDate: undefined,
      serviceItem: {
        ...getNewServiceItemMock(),
        id: 1,
        billableServiceId: 1,
        billableService: getBillableServiceMock(),
        quantity: 3,
        subscriptionOrders: [],
        optionalSubscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            isFinalForService: true,
            action: BillableItemActionEnum.final,
            quantity: 1,
          },
        ],
      },
      initialServiceItem: undefined,
      billableServices: [],
      updateServiceItemSubscriptionOrders: updateServiceItemSubscriptionOrdersMock,
    });

    expect(
      updateServiceItemSubscriptionOrdersMock.mock.calls[0][0].optionalSubscriptionOrders,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 0,
          isFinalForService: true,
          quantity: 3,
        }),
      ]),
    );
  });

  test('should add delivery and "final for service subscription order" when subscription end date is selected before service selection', () => {
    const { rerender } = renderHook<ISubscriptionOrderWithServiceItemSynchroniser, void>(
      initialProps => useSubscriptionOrdersWithServiceItemSynchronizer(initialProps),
      {
        initialProps: {
          isSubscriptionDraftEdit: false,
          subscriptionEndDate: new Date('December 1, 2021 00:00:00'),
          serviceItem: {
            ...getNewServiceItemMock(),
            id: 0,
            billableServiceId: 0,
            billableService: undefined,
            quantity: 1,
            subscriptionOrders: [],
            optionalSubscriptionOrders: [],
          },
          initialServiceItem: undefined,
          billableServices: [],
          updateServiceItemSubscriptionOrders: updateServiceItemSubscriptionOrdersMock,
        },
      },
    );

    rerender({
      isSubscriptionDraftEdit: false,
      subscriptionEndDate: new Date('December 1, 2021 00:00:00'),
      serviceItem: {
        ...getNewServiceItemMock(),
        id: 0,
        billableServiceId: 1,
        billableService: getBillableServiceMock(),
        quantity: 1,
        subscriptionOrders: [],
        optionalSubscriptionOrders: [],
      },
      initialServiceItem: undefined,
      billableServices: [],
      updateServiceItemSubscriptionOrders: updateServiceItemSubscriptionOrdersMock,
    });

    expect(updateServiceItemSubscriptionOrdersMock.mock.calls.length).toBe(1);
    expect(
      updateServiceItemSubscriptionOrdersMock.mock.calls[0][0].optionalSubscriptionOrders,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 0,
          action: BillableItemActionEnum.delivery,
        }),
        expect.objectContaining({
          id: 0,
          action: BillableItemActionEnum.final,
          isFinalForService: true,
        }),
      ]),
    );
  });

  test('should remove all subscription orders when billable service is undefined', () => {
    const { rerender } = renderHook<ISubscriptionOrderWithServiceItemSynchroniser, void>(
      initialProps => useSubscriptionOrdersWithServiceItemSynchronizer(initialProps),
      {
        initialProps: {
          isSubscriptionDraftEdit: false,
          subscriptionEndDate: undefined,
          serviceItem: {
            ...getNewServiceItemMock(),
            billableServiceId: 1,
            subscriptionOrders: [getNewSubscriptionOrderMock(), getNewSubscriptionOrderMock()],
            optionalSubscriptionOrders: [
              getNewSubscriptionOrderMock(),
              getNewSubscriptionOrderMock(),
            ],
          },
          initialServiceItem: undefined,
          billableServices: [],
          updateServiceItemSubscriptionOrders: updateServiceItemSubscriptionOrdersMock,
        },
      },
    );

    rerender({
      isSubscriptionDraftEdit: false,
      subscriptionEndDate: undefined,
      serviceItem: {
        ...getNewServiceItemMock(),
        billableServiceId: 0,
        subscriptionOrders: [getNewSubscriptionOrderMock(), getNewSubscriptionOrderMock()],
        optionalSubscriptionOrders: [getNewSubscriptionOrderMock(), getNewSubscriptionOrderMock()],
      },
      initialServiceItem: undefined,
      billableServices: [],
      updateServiceItemSubscriptionOrders: updateServiceItemSubscriptionOrdersMock,
    });

    expect(updateServiceItemSubscriptionOrdersMock.mock.calls[0][0].subscriptionOrders.length).toBe(
      0,
    );
    expect(
      updateServiceItemSubscriptionOrdersMock.mock.calls[0][0].optionalSubscriptionOrders.length,
    ).toBe(0);
  });

  test('should remove all subscription orders when unsaved service quantity is zero', () => {
    const { rerender } = renderHook<ISubscriptionOrderWithServiceItemSynchroniser, void>(
      initialProps => useSubscriptionOrdersWithServiceItemSynchronizer(initialProps),
      {
        initialProps: {
          isSubscriptionDraftEdit: false,
          subscriptionEndDate: undefined,
          serviceItem: {
            ...getNewServiceItemMock(),
            id: 0,
            billableServiceId: 1,
            quantity: 1,
            subscriptionOrders: [getNewSubscriptionOrderMock(), getNewSubscriptionOrderMock()],
            optionalSubscriptionOrders: [
              getNewSubscriptionOrderMock(),
              getNewSubscriptionOrderMock(),
            ],
          },
          initialServiceItem: undefined,
          billableServices: [],
          updateServiceItemSubscriptionOrders: updateServiceItemSubscriptionOrdersMock,
        },
      },
    );

    rerender({
      isSubscriptionDraftEdit: false,
      subscriptionEndDate: undefined,
      serviceItem: {
        ...getNewServiceItemMock(),
        id: 0,
        billableServiceId: 1,
        quantity: 0,
        subscriptionOrders: [getNewSubscriptionOrderMock(), getNewSubscriptionOrderMock()],
        optionalSubscriptionOrders: [getNewSubscriptionOrderMock(), getNewSubscriptionOrderMock()],
      },
      initialServiceItem: undefined,
      billableServices: [],
      updateServiceItemSubscriptionOrders: updateServiceItemSubscriptionOrdersMock,
    });

    expect(updateServiceItemSubscriptionOrdersMock.mock.calls[0][0].subscriptionOrders.length).toBe(
      0,
    );
    expect(
      updateServiceItemSubscriptionOrdersMock.mock.calls[0][0].optionalSubscriptionOrders.length,
    ).toBe(0);
  });
});
