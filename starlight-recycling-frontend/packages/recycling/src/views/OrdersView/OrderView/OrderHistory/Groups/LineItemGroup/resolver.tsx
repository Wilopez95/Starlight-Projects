import React from 'react';
import { IOrderHistoryChange } from '../../types';

import { OrderHistoryLineItemPriceChanges } from './Price/Price';
import { OrderHistoryLineItemQuantityChanges } from './Quantity/Quantity';
import { OrderHistoryLineItemTypeChanges } from './Type/Type';

export const resolveEditedChanges = (
  change: IOrderHistoryChange,
  description: string,
): React.ReactNode => {
  const props = {
    newValue: change.newValue,
    prevValue: change.previousValue,
    populated: {
      newValue: change.populatedValues?.newValue,
      prevValue: change.populatedValues?.previousValue,
    },
    prefix: change?.prefix,
  };

  switch (change.attribute) {
    case 'billableLineItemId': {
      return <OrderHistoryLineItemTypeChanges {...props} description={description} />;
    }
    case 'quantity': {
      return <OrderHistoryLineItemQuantityChanges {...props} description={description} />;
    }
    case 'price': {
      return <OrderHistoryLineItemPriceChanges {...props} description={description} />;
    }
  }

  return null;
};
