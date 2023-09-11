import { BillableItemActionEnum } from '@root/consts';
import { EquipmentItemType } from '@root/types';
import {
  getBillableServiceMock,
  getEquipmentItemMock,
  getNewSubscriptionOrderMock,
} from '@tests/__mocks__';

import { addSubscriptionOrderIfNeeded } from '../addSubscriptionOrderIfNeeded';

describe('addSubscriptionOrderIfNeeded', () => {
  test('should add new subscription order when service item has included service with needed action', () => {
    const result = addSubscriptionOrderIfNeeded({
      isSubscriptionDraftEdit: false,
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [],
        optionalSubscriptionOrders: [],
      },
      billableServices: [
        {
          ...getBillableServiceMock(),
          id: 1,
          action: BillableItemActionEnum.delivery,
          equipmentItem: {
            ...getEquipmentItemMock(),
            type: EquipmentItemType.portableToilet,
          },
        },
      ],
      action: BillableItemActionEnum.delivery,
      isFinalForService: false,
      serviceItemBillableService: {
        ...getBillableServiceMock(),
        id: 2,
        action: BillableItemActionEnum.delivery,
        services: [1],
        equipmentItem: {
          ...getEquipmentItemMock(),
          type: EquipmentItemType.portableToilet,
        },
      },
    });

    expect(result.subscriptionOrders.length).toBe(1);
    expect(result.optionalSubscriptionOrders.length).toBe(0);
    expect(result.subscriptionOrders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 0,
          action: BillableItemActionEnum.delivery,
        }),
      ]),
    );
  });

  test("should add new optional subscription order when service item hasn't included service with needed action", () => {
    const result = addSubscriptionOrderIfNeeded({
      isSubscriptionDraftEdit: false,
      billableServices: [
        {
          ...getBillableServiceMock(),
          id: 1,
          action: BillableItemActionEnum.delivery,
          equipmentItem: {
            ...getEquipmentItemMock(),
            type: EquipmentItemType.portableToilet,
          },
        },
      ],
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [],
        optionalSubscriptionOrders: [],
      },
      action: BillableItemActionEnum.delivery,
      isFinalForService: false,
      serviceItemBillableService: {
        ...getBillableServiceMock(),
        id: 2,
        action: BillableItemActionEnum.delivery,
        services: [],
        equipmentItem: {
          ...getEquipmentItemMock(),
          type: EquipmentItemType.portableToilet,
        },
      },
    });

    expect(result.optionalSubscriptionOrders.length).toBe(1);
    expect(result.subscriptionOrders.length).toBe(0);
    expect(result.optionalSubscriptionOrders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 0,
          billableServiceId: 0,
          subscriptionOrderOptions: expect.arrayContaining([
            expect.objectContaining({
              value: 1,
            }),
          ]),
        }),
      ]),
    );
  });

  test('should select billable service for new subscription order when service item includes only one service with needed action', () => {
    const result = addSubscriptionOrderIfNeeded({
      isSubscriptionDraftEdit: false,
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [],
        optionalSubscriptionOrders: [],
      },
      billableServices: [
        {
          ...getBillableServiceMock(),
          id: 1,
          action: BillableItemActionEnum.delivery,
          equipmentItem: {
            ...getEquipmentItemMock(),
            type: EquipmentItemType.portableToilet,
          },
        },
      ],
      action: BillableItemActionEnum.delivery,
      isFinalForService: false,
      serviceItemBillableService: {
        ...getBillableServiceMock(),
        id: 2,
        action: BillableItemActionEnum.delivery,
        services: [1],
        equipmentItem: {
          ...getEquipmentItemMock(),
          type: EquipmentItemType.portableToilet,
        },
      },
    });

    expect(result.subscriptionOrders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          billableServiceId: 1,
        }),
      ]),
    );
  });

  test('should leave billable service empty for new subscription order when service item includes multiple services with needed action', () => {
    const result = addSubscriptionOrderIfNeeded({
      isSubscriptionDraftEdit: false,
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [],
        optionalSubscriptionOrders: [],
      },
      billableServices: [
        {
          ...getBillableServiceMock(),
          id: 1,
          action: BillableItemActionEnum.delivery,
          equipmentItem: {
            ...getEquipmentItemMock(),
            type: EquipmentItemType.portableToilet,
          },
        },
        {
          ...getBillableServiceMock(),
          id: 2,
          action: BillableItemActionEnum.delivery,
          equipmentItem: {
            ...getEquipmentItemMock(),
            type: EquipmentItemType.portableToilet,
          },
        },
      ],
      action: BillableItemActionEnum.delivery,
      isFinalForService: false,
      serviceItemBillableService: {
        ...getBillableServiceMock(),
        id: 3,
        action: BillableItemActionEnum.delivery,
        services: [1, 2],
        equipmentItem: {
          ...getEquipmentItemMock(),
          type: EquipmentItemType.portableToilet,
        },
      },
    });

    expect(result.subscriptionOrders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 0,
          billableServiceId: 0,
        }),
      ]),
    );
  });

  test('should leave service date undefined for subscription order when it is not passed', () => {
    const result = addSubscriptionOrderIfNeeded({
      isSubscriptionDraftEdit: false,
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [],
        optionalSubscriptionOrders: [],
      },
      billableServices: [
        {
          ...getBillableServiceMock(),
          id: 1,
          action: BillableItemActionEnum.delivery,
          equipmentItem: {
            ...getEquipmentItemMock(),
            type: EquipmentItemType.portableToilet,
          },
        },
      ],
      action: BillableItemActionEnum.delivery,
      isFinalForService: false,
      serviceItemBillableService: {
        ...getBillableServiceMock(),
        id: 2,
        action: BillableItemActionEnum.delivery,
        services: [1],
        equipmentItem: {
          ...getEquipmentItemMock(),
          type: EquipmentItemType.portableToilet,
        },
      },
    });

    expect(result.subscriptionOrders[0].serviceDate).toBe(undefined);
  });

  test('should do nothing when needed subscription order is already added', () => {
    const result = addSubscriptionOrderIfNeeded({
      isSubscriptionDraftEdit: false,
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            action: BillableItemActionEnum.delivery,
          },
        ],
        optionalSubscriptionOrders: [],
      },
      billableServices: [
        {
          ...getBillableServiceMock(),
          id: 1,
          action: BillableItemActionEnum.delivery,
          equipmentItem: {
            ...getEquipmentItemMock(),
            type: EquipmentItemType.portableToilet,
          },
        },
      ],
      action: BillableItemActionEnum.delivery,
      isFinalForService: false,
      serviceItemBillableService: {
        ...getBillableServiceMock(),
        id: 2,
        action: BillableItemActionEnum.delivery,
        services: [1],
        equipmentItem: {
          ...getEquipmentItemMock(),
          type: EquipmentItemType.portableToilet,
        },
      },
    });

    expect(result.subscriptionOrders.length).toBe(1);
    expect(result.optionalSubscriptionOrders.length).toBe(0);
    expect(result.subscriptionOrders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 0,
          action: BillableItemActionEnum.delivery,
        }),
      ]),
    );
  });

  test('should do nothing when needed optional subscription order is already added', () => {
    const result = addSubscriptionOrderIfNeeded({
      isSubscriptionDraftEdit: false,
      billableServices: [
        {
          ...getBillableServiceMock(),
          id: 1,
          action: BillableItemActionEnum.delivery,
          equipmentItem: {
            ...getEquipmentItemMock(),
            type: EquipmentItemType.portableToilet,
          },
        },
      ],
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [],
        optionalSubscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            action: BillableItemActionEnum.delivery,
          },
        ],
      },
      action: BillableItemActionEnum.delivery,
      isFinalForService: false,
      serviceItemBillableService: {
        ...getBillableServiceMock(),
        id: 2,
        action: BillableItemActionEnum.delivery,
        services: [],
        equipmentItem: {
          ...getEquipmentItemMock(),
          type: EquipmentItemType.portableToilet,
        },
      },
    });

    expect(result.optionalSubscriptionOrders.length).toBe(1);
    expect(result.subscriptionOrders.length).toBe(0);
    expect(result.optionalSubscriptionOrders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 0,
          billableServiceId: 1,
        }),
      ]),
    );
  });

  test('should do nothing when optional subscription order is already added', () => {
    const result = addSubscriptionOrderIfNeeded({
      isSubscriptionDraftEdit: false,
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 0,
            billableServiceId: 1,
          },
        ],
        optionalSubscriptionOrders: [],
      },
      billableServices: [
        {
          ...getBillableServiceMock(),
          id: 1,
          action: BillableItemActionEnum.delivery,
          equipmentItem: {
            ...getEquipmentItemMock(),
            type: EquipmentItemType.portableToilet,
          },
        },
      ],
      action: BillableItemActionEnum.delivery,
      isFinalForService: false,
      serviceItemBillableService: {
        ...getBillableServiceMock(),
        id: 3,
        action: BillableItemActionEnum.delivery,
        services: [],
        equipmentItem: {
          ...getEquipmentItemMock(),
          type: EquipmentItemType.portableToilet,
        },
      },
    });

    expect(result.optionalSubscriptionOrders.length).toBe(0);

    expect(result.subscriptionOrders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 0,
          billableServiceId: 1,
        }),
      ]),
    );
  });

  test('should add new subscription order when needed subscription order is already added and saved', () => {
    const result = addSubscriptionOrderIfNeeded({
      isSubscriptionDraftEdit: false,
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 1,
            action: BillableItemActionEnum.delivery,
          },
        ],
        optionalSubscriptionOrders: [],
      },
      billableServices: [
        {
          ...getBillableServiceMock(),
          id: 1,
          action: BillableItemActionEnum.delivery,
          equipmentItem: {
            ...getEquipmentItemMock(),
            type: EquipmentItemType.portableToilet,
          },
        },
      ],
      action: BillableItemActionEnum.delivery,
      isFinalForService: false,
      serviceItemBillableService: {
        ...getBillableServiceMock(),
        id: 2,
        action: BillableItemActionEnum.delivery,
        services: [1],
        equipmentItem: {
          ...getEquipmentItemMock(),
          type: EquipmentItemType.portableToilet,
        },
      },
    });

    expect(result.subscriptionOrders.length).toBe(2);
    expect(result.subscriptionOrders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          action: BillableItemActionEnum.delivery,
        }),
        expect.objectContaining({
          id: 0,
          action: BillableItemActionEnum.delivery,
        }),
      ]),
    );
  });

  test('should do nothing when final for service subscription order is already added and saved', () => {
    const result = addSubscriptionOrderIfNeeded({
      isSubscriptionDraftEdit: false,
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [
          {
            ...getNewSubscriptionOrderMock(),
            id: 1,
            action: BillableItemActionEnum.final,
            isFinalForService: true,
          },
        ],
        optionalSubscriptionOrders: [],
      },
      billableServices: [
        {
          ...getBillableServiceMock(),
          id: 1,
          action: BillableItemActionEnum.final,
          equipmentItem: {
            ...getEquipmentItemMock(),
            type: EquipmentItemType.portableToilet,
          },
        },
      ],
      action: BillableItemActionEnum.final,
      isFinalForService: true,
      serviceItemBillableService: {
        ...getBillableServiceMock(),
        id: 2,
        action: BillableItemActionEnum.final,
        services: [1],
        equipmentItem: {
          ...getEquipmentItemMock(),
          type: EquipmentItemType.portableToilet,
        },
      },
    });

    expect(result.subscriptionOrders.length).toBe(1);
    expect(result.subscriptionOrders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          action: BillableItemActionEnum.final,
        }),
      ]),
    );
  });

  test('should provide options with the same action as on service item when adding new subscription order', () => {
    const result = addSubscriptionOrderIfNeeded({
      isSubscriptionDraftEdit: false,
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [],
        optionalSubscriptionOrders: [],
      },
      billableServices: [
        {
          ...getBillableServiceMock(),
          id: 1,
          action: BillableItemActionEnum.delivery,
          equipmentItem: {
            ...getEquipmentItemMock(),
            id: 1,
          },
        },
        {
          ...getBillableServiceMock(),
          id: 2,
          action: BillableItemActionEnum.final,
          equipmentItem: {
            ...getEquipmentItemMock(),
            id: 1,
          },
        },
      ],
      action: BillableItemActionEnum.delivery,
      isFinalForService: false,
      serviceItemBillableService: {
        ...getBillableServiceMock(),
        id: 2,
        action: BillableItemActionEnum.delivery,
        services: [1],
        equipmentItem: {
          ...getEquipmentItemMock(),
          id: 1,
        },
      },
    });

    expect(result.subscriptionOrders[0].subscriptionOrderOptions.length).toBe(1);
    expect(result.subscriptionOrders[0].subscriptionOrderOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: BillableItemActionEnum.delivery,
        }),
      ]),
    );
  });

  test('should provide options with the same equipment type as on service item when adding new subscription order', () => {
    const result = addSubscriptionOrderIfNeeded({
      isSubscriptionDraftEdit: false,
      serviceItemSubscriptionOrders: {
        subscriptionOrders: [],
        optionalSubscriptionOrders: [],
      },
      billableServices: [
        {
          ...getBillableServiceMock(),
          id: 1,
          action: BillableItemActionEnum.delivery,
          equipmentItem: {
            ...getEquipmentItemMock(),
            id: 1,
          },
        },
        {
          ...getBillableServiceMock(),
          id: 2,
          action: BillableItemActionEnum.delivery,
          equipmentItem: {
            ...getEquipmentItemMock(),
            id: 2,
          },
        },
      ],
      action: BillableItemActionEnum.delivery,
      isFinalForService: false,
      serviceItemBillableService: {
        ...getBillableServiceMock(),
        id: 2,
        action: BillableItemActionEnum.delivery,
        services: [1],
        equipmentItem: {
          ...getEquipmentItemMock(),
          id: 1,
        },
      },
    });

    expect(result.subscriptionOrders[0].subscriptionOrderOptions.length).toBe(1);
    expect(result.subscriptionOrders[0].subscriptionOrderOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: 1,
        }),
      ]),
    );
  });
});
