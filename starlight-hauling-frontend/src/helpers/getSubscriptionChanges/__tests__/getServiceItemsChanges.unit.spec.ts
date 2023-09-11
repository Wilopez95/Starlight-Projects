import {
  getClosedServiceItemsAndNewOneWithLineItemsAndSubOrdersChangesMock,
  getClosedServiceItemsAndNewOneWithLineItemsAndSubOrdersMock,
  getClosedServiceItemsWithNewChangesMock,
  getClosedServiceItemsWithNewMock,
  getOriginalServiceItemsMock,
  getOriginalServiceItemsWithLineItemsAndSubOrdersMock,
  getServiceItemsAndNewOneWithLineItemsAndSubOrdersChangesMock,
  getServiceItemsAndNewOneWithLineItemsAndSubOrdersMock,
  getServiceItemsChangesMock,
  getServiceItemsMock,
  getServiceItemsWithLineItemsAndSubOrdersChangesMock,
  getServiceItemsWithLineItemsAndSubOrdersMock,
  getServiceItemsWithMinorChangesMock,
  getServiceItemsWithNewServiceItemChangesMock,
  getServiceItemsWithNewServiceItemMock,
  getServiceItemsWithUpdatedOnlyLineItemsAndSubOrdersChangesMock,
  getServiceItemsWithUpdatedOnlyLineItemsAndSubOrdersMock,
} from '@tests/__mocks__';

import { getServiceItemsChanges } from '../getServiceItemsChanges';

import { options } from './options';

describe('getServiceItemsChanges', () => {
  test('should found no changes when changed additional fields', () => {
    expect(
      getServiceItemsChanges(
        getOriginalServiceItemsMock(),
        getServiceItemsWithMinorChangesMock(),
        options,
      ),
    ).toEqual([]);
  });

  test('should found service items changes when services were updated', () => {
    expect(
      getServiceItemsChanges(getOriginalServiceItemsMock(), getServiceItemsMock(), options),
    ).toEqual(getServiceItemsChangesMock());
  });

  test('should found changes and new service item when services were updated and one new was added', () => {
    expect(
      getServiceItemsChanges(
        getOriginalServiceItemsMock(),
        getServiceItemsWithNewServiceItemMock(),
        options,
      ),
    ).toEqual(getServiceItemsWithNewServiceItemChangesMock());
  });

  test('should found 2 closed service items and one new service item when old services were closed and one new was added', () => {
    expect(
      getServiceItemsChanges(
        getOriginalServiceItemsMock(),
        getClosedServiceItemsWithNewMock(),
        options,
      ),
    ).toEqual(getClosedServiceItemsWithNewChangesMock());
  });

  test('should found changes with line items and sub orders when service was updated and sub order was added', () => {
    expect(
      getServiceItemsChanges(
        getOriginalServiceItemsWithLineItemsAndSubOrdersMock(),
        getServiceItemsWithLineItemsAndSubOrdersMock(),
        options,
      ),
    ).toEqual(getServiceItemsWithLineItemsAndSubOrdersChangesMock());
  });

  test('should found changes and new service item with line items and sub orders when were updated services, line items and sub orders', () => {
    expect(
      getServiceItemsChanges(
        getOriginalServiceItemsWithLineItemsAndSubOrdersMock(),
        getServiceItemsAndNewOneWithLineItemsAndSubOrdersMock(),
        options,
      ),
    ).toEqual(getServiceItemsAndNewOneWithLineItemsAndSubOrdersChangesMock());
  });

  test('should found changes only in line items and sub orders when service was not updated', () => {
    expect(
      getServiceItemsChanges(
        getOriginalServiceItemsWithLineItemsAndSubOrdersMock(),
        getServiceItemsWithUpdatedOnlyLineItemsAndSubOrdersMock(),
        options,
      ),
    ).toEqual(getServiceItemsWithUpdatedOnlyLineItemsAndSubOrdersChangesMock());
  });

  test('should found 2 closed service items and new service item with line items and sub orders when old services were closed and one new was added', () => {
    expect(
      getServiceItemsChanges(
        getOriginalServiceItemsWithLineItemsAndSubOrdersMock(),
        getClosedServiceItemsAndNewOneWithLineItemsAndSubOrdersMock(),
        options,
      ),
    ).toEqual(getClosedServiceItemsAndNewOneWithLineItemsAndSubOrdersChangesMock());
  });
});
