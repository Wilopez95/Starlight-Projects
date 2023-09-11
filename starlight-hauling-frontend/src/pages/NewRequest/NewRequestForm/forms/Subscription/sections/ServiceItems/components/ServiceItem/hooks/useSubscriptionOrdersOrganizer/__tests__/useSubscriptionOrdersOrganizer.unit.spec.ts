import { renderHook } from '@testing-library/react-hooks';

import { ISubscriptionOrdersOrganizer } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/sections/ServiceItems/components/ServiceItem/hooks/useSubscriptionOrdersOrganizer/types';
import { INewServiceItemSubscriptionOrders } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import { getNewSubscriptionOrderMock } from '@tests/__mocks__';

import { useSubscriptionOrdersOrganizer } from '../useSubscriptionOrdersOrganizer';

describe('useSubscriptionOrdersOrganizer', () => {
  let updateSubscriptionOrdersMock: jest.Mock<void, [INewServiceItemSubscriptionOrders]>;

  beforeEach(() => {
    updateSubscriptionOrdersMock = jest.fn();
  });

  test('should put "final for service subscription order" to the end when organizing', () => {
    const { rerender } = renderHook<ISubscriptionOrdersOrganizer, void>(
      initialProps => useSubscriptionOrdersOrganizer(initialProps),
      {
        initialProps: {
          serviceItemSubscriptionOrders: {
            subscriptionOrders: [],
            optionalSubscriptionOrders: [],
          },

          updateServiceItemSubscriptionOrders: updateSubscriptionOrdersMock,
        },
      },
    );

    rerender({
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            isFinalForService: true,
          },
          {
            ...getNewSubscriptionOrderMock(),
            id: 1,
            isFinalForService: false,
          },
          {
            ...getNewSubscriptionOrderMock(),
            id: 2,
            isFinalForService: false,
          },
        ],
        optionalSubscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            isFinalForService: true,
          },
          {
            ...getNewSubscriptionOrderMock(),
            id: 1,
            isFinalForService: false,
          },
          {
            ...getNewSubscriptionOrderMock(),
            id: 2,
            isFinalForService: false,
          },
        ],
      },

      updateServiceItemSubscriptionOrders: updateSubscriptionOrdersMock,
    });

    expect(updateSubscriptionOrdersMock.mock.calls[1][0].subscriptionOrders).toMatchObject([
      { isFinalForService: false },
      { isFinalForService: false },
      { isFinalForService: true },
    ]);

    expect(updateSubscriptionOrdersMock.mock.calls[1][0].optionalSubscriptionOrders).toMatchObject([
      { isFinalForService: false },
      { isFinalForService: false },
      { isFinalForService: true },
    ]);
  });

  test('should sort subscription orders by service date when organizing', () => {
    const { rerender } = renderHook<ISubscriptionOrdersOrganizer, void>(
      initialProps => useSubscriptionOrdersOrganizer(initialProps),
      {
        initialProps: {
          serviceItemSubscriptionOrders: {
            subscriptionOrders: [],
            optionalSubscriptionOrders: [],
          },
          updateServiceItemSubscriptionOrders: updateSubscriptionOrdersMock,
        },
      },
    );

    rerender({
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 3,
            serviceDate: new Date('December 3, 2021 00:00:00'),
          },
          {
            ...getNewSubscriptionOrderMock(),
            id: 2,
            serviceDate: new Date('December 2, 2021 00:00:00'),
          },
          {
            ...getNewSubscriptionOrderMock(),
            id: 1,
            serviceDate: new Date('December 1, 2021 00:00:00'),
          },
        ],
        optionalSubscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 3,
            serviceDate: new Date('December 3, 2021 00:00:00'),
          },
          {
            ...getNewSubscriptionOrderMock(),
            id: 2,
            serviceDate: new Date('December 2, 2021 00:00:00'),
          },
          {
            ...getNewSubscriptionOrderMock(),
            id: 1,
            serviceDate: new Date('December 1, 2021 00:00:00'),
          },
        ],
      },

      updateServiceItemSubscriptionOrders: updateSubscriptionOrdersMock,
    });

    expect(updateSubscriptionOrdersMock.mock.calls[1][0].subscriptionOrders).toMatchObject([
      { serviceDate: new Date('December 1, 2021 00:00:00') },
      { serviceDate: new Date('December 2, 2021 00:00:00') },
      { serviceDate: new Date('December 3, 2021 00:00:00') },
    ]);

    expect(updateSubscriptionOrdersMock.mock.calls[1][0].optionalSubscriptionOrders).toMatchObject([
      { serviceDate: new Date('December 1, 2021 00:00:00') },
      { serviceDate: new Date('December 2, 2021 00:00:00') },
      { serviceDate: new Date('December 3, 2021 00:00:00') },
    ]);
  });

  test('should remove quantity from subscription orders with service date after "final for service subscription order" when organising', () => {
    const { rerender } = renderHook<ISubscriptionOrdersOrganizer, void>(
      initialProps => useSubscriptionOrdersOrganizer(initialProps),
      {
        initialProps: {
          serviceItemSubscriptionOrders: {
            subscriptionOrders: [],
            optionalSubscriptionOrders: [],
          },

          updateServiceItemSubscriptionOrders: updateSubscriptionOrdersMock,
        },
      },
    );

    rerender({
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 1,
            serviceDate: new Date('December 1, 2021 00:00:00'),
          },
          {
            ...getNewSubscriptionOrderMock(),
            id: 2,
            serviceDate: new Date('December 2, 2021 00:00:00'),
            isFinalForService: true,
          },
          {
            ...getNewSubscriptionOrderMock(),
            id: 3,
            serviceDate: new Date('December 3, 2021 00:00:00'),
          },
        ],
        optionalSubscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 1,
            serviceDate: new Date('December 1, 2021 00:00:00'),
          },
          {
            ...getNewSubscriptionOrderMock(),
            id: 2,
            serviceDate: new Date('December 2, 2021 00:00:00'),
            isFinalForService: true,
          },
          {
            ...getNewSubscriptionOrderMock(),
            id: 3,
            serviceDate: new Date('December 3, 2021 00:00:00'),
          },
        ],
      },

      updateServiceItemSubscriptionOrders: updateSubscriptionOrdersMock,
    });

    expect(updateSubscriptionOrdersMock.mock.calls[1][0].subscriptionOrders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          quantity: 1,
        }),
        expect.objectContaining({
          id: 2,
          quantity: 1,
          isFinalForService: true,
        }),
        expect.objectContaining({
          id: 3,
          quantity: 0,
        }),
      ]),
    );
  });

  test('should remove new subscription orders with service date after "final for service subscription order" when organising', () => {
    const { rerender } = renderHook<ISubscriptionOrdersOrganizer, void>(
      initialProps => useSubscriptionOrdersOrganizer(initialProps),
      {
        initialProps: {
          serviceItemSubscriptionOrders: {
            subscriptionOrders: [],
            optionalSubscriptionOrders: [],
          },

          updateServiceItemSubscriptionOrders: updateSubscriptionOrdersMock,
        },
      },
    );

    rerender({
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 1,
            serviceDate: new Date('December 1, 2021 00:00:00'),
          },
          {
            ...getNewSubscriptionOrderMock(),
            id: 2,
            serviceDate: new Date('December 2, 2021 00:00:00'),
            isFinalForService: true,
          },
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            serviceDate: new Date('December 3, 2021 00:00:00'),
          },
        ],
        optionalSubscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 1,
            serviceDate: new Date('December 1, 2021 00:00:00'),
          },
          {
            ...getNewSubscriptionOrderMock(),
            id: 2,
            serviceDate: new Date('December 2, 2021 00:00:00'),
            isFinalForService: true,
          },
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            serviceDate: new Date('December 3, 2021 00:00:00'),
          },
        ],
      },

      updateServiceItemSubscriptionOrders: updateSubscriptionOrdersMock,
    });

    expect(updateSubscriptionOrdersMock.mock.calls[1][0].subscriptionOrders.length).toBe(2);

    expect(updateSubscriptionOrdersMock.mock.calls[1][0].subscriptionOrders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          serviceDate: new Date('December 1, 2021 00:00:00'),
        }),
        expect.objectContaining({
          serviceDate: new Date('December 2, 2021 00:00:00'),
          isFinalForService: true,
        }),
      ]),
    );
  });
});
