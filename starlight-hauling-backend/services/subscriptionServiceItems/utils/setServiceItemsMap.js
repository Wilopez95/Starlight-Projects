import omit from 'lodash/fp/omit.js';

import { setFrequenciesMap } from './setFrequenciesMap.js';
import { setOneTimeOrderLineItemMap } from './setOneTimeOrderLineItemMap.js';

export const setServiceItemsMap = async (
  ctxState,
  {
    skipOneTime,
    serviceItemsInput,
    subscriptionId,
    serviceItemsFrequenciesMap,
    serviceLineItemsInputMap,
    subscriptionOrdersInputMap,
    serviceItemsPreparedInput,
  },
  trx,
) => {
  for (const [idx, serviceItem] of Object.entries(serviceItemsInput)) {
    await setFrequenciesMap(ctxState, { serviceItem, serviceItemsFrequenciesMap }, trx);

    setOneTimeOrderLineItemMap({
      skipOneTime,
      serviceItem,
      idx,
      subscriptionOrdersInputMap,
      serviceLineItemsInputMap,
    });

    const serviceItemForInsertToDB = {
      ...omit(['lineItems', 'subscriptionOrders'])(serviceItem),
      subscriptionId,
    };

    serviceItemsPreparedInput.push(serviceItemForInsertToDB);
  }
};
