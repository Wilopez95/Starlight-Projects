import React from 'react';

import { OrderHistoryThresholdItemPriceChanges } from './Price/Price';
import { OrderHistoryThresholdItemQuantityChanges } from './Quantity/Quantity';
import { IOrderHistoryChange } from '../../types';

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
      return <OrderHistoryThresholdItemQuantityChanges {...props} description={description} />;
    }
    case 'price': {
      return <OrderHistoryThresholdItemPriceChanges {...props} description={description} />;
    }
  }

  return null;
};
