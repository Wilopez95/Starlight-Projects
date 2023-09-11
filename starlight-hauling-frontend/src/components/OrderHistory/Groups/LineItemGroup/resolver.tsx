import React from 'react';
import { IOrderHistoryChange } from '@root/types';
import { OrderHistoryLineItemPriceChanges } from './Price/Price';
import { OrderHistoryLineItemQuantityChanges } from './Quantity/Quantity';
import { OrderHistoryLineItemTypeChanges } from './Type/Type';
import { IOrderHistoryLineItemTypeChanges } from './Type/types';
import { IOrderHistoryLineItemQuantityChanges } from './Quantity/types';
import { IOrderHistoryLineItemPriceChanges } from './Price/types';

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
    case 'billableLineItemId': {
      return (
        <OrderHistoryLineItemTypeChanges
          {...(props as IOrderHistoryLineItemTypeChanges)}
          description={description}
        />
      );
    }
    case 'quantity': {
      return (
        <OrderHistoryLineItemQuantityChanges
          {...(props as IOrderHistoryLineItemQuantityChanges)}
          description={description}
        />
      );
    }
    case 'price': {
      return (
        <OrderHistoryLineItemPriceChanges
          {...(props as IOrderHistoryLineItemPriceChanges)}
          description={description}
        />
      );
    }
    default:
      return null;
  }
};
