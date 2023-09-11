import React from 'react';

import { IOrderHistoryChange } from '../../../types';
import { OrderBillableItemChanges } from './BillableItem/BillableItem';
import { OrderHistoryBillableLineItemPriceChanges } from './Price/Price';
import { OrderHistoryBillableItemsQuantityChanges } from './Quantity/Quantity';

export const resolveEditedChanges = (change: IOrderHistoryChange): React.ReactNode => {
  const props = {
    newValue: change.newValue,
    prevValue: change.previousValue,
    populated: {
      newValue: change.populatedValues?.newValue,
      prevValue: change.populatedValues?.previousValue,
    },
  };

  switch (change.attribute) {
    case 'billableItem': {
      return <OrderBillableItemChanges {...props} />;
    }
    case 'quantity': {
      return <OrderHistoryBillableItemsQuantityChanges {...props} />;
    }
    case 'price': {
      return <OrderHistoryBillableLineItemPriceChanges {...props} />;
    }
  }

  return null;
};
