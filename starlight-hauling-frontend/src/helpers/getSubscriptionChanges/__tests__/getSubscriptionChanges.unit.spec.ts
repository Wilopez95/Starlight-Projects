import {
  getInitialSubscriptionMock,
  getTouchedSubscriptionMock,
  getUpdatedSubscriptionWithItemsChangesMock,
  getUpdatedSubscriptionWithItemsMock,
} from '@tests/__mocks__';

import { getSubscriptionChanges } from '../getSubscriptionChanges';

import { options } from './options';

describe('getSubscriptionChanges', () => {
  test('should found no changes when additional fields were updated', () => {
    expect(
      getSubscriptionChanges(getInitialSubscriptionMock(), getTouchedSubscriptionMock(), options),
    ).toEqual({});
  });

  test('should found full changes and new service when subscription was updated', () => {
    expect(
      getSubscriptionChanges(
        getInitialSubscriptionMock(),
        getUpdatedSubscriptionWithItemsMock(),
        options,
      ),
    ).toEqual(getUpdatedSubscriptionWithItemsChangesMock());
  });
});
