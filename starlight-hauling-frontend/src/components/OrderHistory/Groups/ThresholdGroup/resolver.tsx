import React from 'react';

import { IOrderHistoryChange } from '@root/types';

import { OrderHistoryThresholdItemPriceChanges } from './Price/Price';
import { OrderHistoryThresholdItemQuantityChanges } from './Quantity/Quantity';
import { IOrderHistoryThresholdItemQuantityChanges } from './Quantity/types';

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
  };

  switch (change.attribute) {
    case 'quantity': {
      return (
        <OrderHistoryThresholdItemQuantityChanges
          {...(props as IOrderHistoryThresholdItemQuantityChanges)}
          description={description}
        />
      );
    }
    case 'price': {
      return (
        <OrderHistoryThresholdItemPriceChanges
          {...(props as IOrderHistoryThresholdItemQuantityChanges)}
          description={description}
        />
      );
    }
    default:
      return null;
  }

  return null;
};
