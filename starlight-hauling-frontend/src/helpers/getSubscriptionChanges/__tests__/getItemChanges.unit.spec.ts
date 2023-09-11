import {
  getAddedFourthLineItemChangesMock,
  getAddedFourthLineItemMock,
  getAddedThirdSubscriptionOrderChangesMock,
  getAddedThirdSubscriptionOrderMock,
  getClosedSecondSubscriptionOrderChangesMock,
  getClosedSecondSubscriptionOrderMock,
  getClosedThirdLineItemChangesMock,
  getClosedThirdLineItemMock,
  getFirstSubscriptionOrderWithMinorChangesMock,
  getOriginalLineItemsMock,
  getOriginalSubscriptionOrdersMock,
  getSecondLineItemWithMinorChangesMock,
  getUpdatedFirstSubscriptionOrderChangesMock,
  getUpdatedFirstSubscriptionOrderMock,
  getUpdatedSecondLineItemChangesMock,
  getUpdatedSecondLineItemMock,
} from '@tests/__mocks__';

import { getItemChanges } from '../getItemChanges';

import { options } from './options';

describe('getItemChanges', () => {
  describe('get subscription order changes', () => {
    test('should no found changes when changed additional fields', () => {
      expect(
        getItemChanges(
          getFirstSubscriptionOrderWithMinorChangesMock(),
          getOriginalSubscriptionOrdersMock(),
          options.editableSubscriptionOrderProps,
          options,
        ),
      ).toEqual(undefined);
    });

    test('should found updated fields when order was updated', () => {
      expect(
        getItemChanges(
          getUpdatedFirstSubscriptionOrderMock(),
          getOriginalSubscriptionOrdersMock(),
          options.editableSubscriptionOrderProps,
          options,
        ),
      ).toEqual(getUpdatedFirstSubscriptionOrderChangesMock());
    });

    test('should found event remove when order was closed', () => {
      expect(
        getItemChanges(
          getClosedSecondSubscriptionOrderMock(),
          getOriginalSubscriptionOrdersMock(),
          options.editableSubscriptionOrderProps,
          options,
        ),
      ).toEqual(getClosedSecondSubscriptionOrderChangesMock());
    });

    test('should found event add when order was added', () => {
      expect(
        getItemChanges(
          getAddedThirdSubscriptionOrderMock(),
          getOriginalSubscriptionOrdersMock(),
          options.editableSubscriptionOrderProps,
          options,
        ),
      ).toEqual(getAddedThirdSubscriptionOrderChangesMock());
    });
  });

  describe('get line item changes', () => {
    test('should no found changes when changed additional fields', () => {
      expect(
        getItemChanges(
          getSecondLineItemWithMinorChangesMock(),
          getOriginalLineItemsMock(),
          options.editableLineItemProps,
          options,
        ),
      ).toEqual(undefined);
    });

    test('should found updated fields when line item was updated', () => {
      expect(
        getItemChanges(
          getUpdatedSecondLineItemMock(),
          getOriginalLineItemsMock(),
          options.editableLineItemProps,
          options,
        ),
      ).toEqual(getUpdatedSecondLineItemChangesMock());
    });

    test('should found event remove when line item was closed', () => {
      expect(
        getItemChanges(
          getClosedThirdLineItemMock(),
          getOriginalLineItemsMock(),
          options.editableLineItemProps,
          options,
        ),
      ).toEqual(getClosedThirdLineItemChangesMock());
    });

    test('should found event add when line item was added', () => {
      expect(
        getItemChanges(
          getAddedFourthLineItemMock(),
          getOriginalLineItemsMock(),
          options.editableLineItemProps,
          options,
        ),
      ).toEqual(getAddedFourthLineItemChangesMock());
    });
  });
});
