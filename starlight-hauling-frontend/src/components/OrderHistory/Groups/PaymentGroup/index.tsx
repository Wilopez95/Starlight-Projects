import React from 'react';

import { IOrderHistoryChange, IOrderHistoryItem } from '@root/types';

import { HistoryRow } from '../../components/HistoryRow/HistoryRow';

import { IBaseOrderHistoryChange } from '../types';
import { CapturedPayment } from './CapturedPayment/CapturedPayment';
import { OrderHistoryCreatePayment } from './CreatePayment/CreatePayment';
import { OrderHistoryRefundChanges } from './Refund/Refund';
import { OrderHistoryPaymentStatusChanges } from './Status/Status';

const resolver = (change: IOrderHistoryChange) => {
  const props = {
    newValue: change.newValue,
    prevValue: change.previousValue,
    populated: {
      newValue: change.populatedValues?.newValue,
      prevValue: change.populatedValues?.previousValue,
    },
  };

  if (change.attribute === 'status') {
    return (
      <OrderHistoryPaymentStatusChanges
        {...(props as unknown as IBaseOrderHistoryChange<string, string | null>)}
      />
    );
  }

  return null;
};

export const resolveOrderHistoryItemPaymentGroupEvent = (
  historyItem: IOrderHistoryItem,
): React.ReactNode => {
  switch (historyItem.eventType) {
    case 'created': {
      return <OrderHistoryCreatePayment historyItem={historyItem} />;
    }
    case 'edited': {
      if (historyItem.changes.find(x => x.attribute === 'refundType')) {
        return (
          <HistoryRow key="refund">
            <OrderHistoryRefundChanges historyItem={historyItem} />
          </HistoryRow>
        );
      }

      if (
        historyItem.changes.find(
          x =>
            x.attribute === 'status' &&
            x.previousValue === 'authorized' &&
            x.newValue === 'captured',
        )
      ) {
        return (
          <HistoryRow>
            <CapturedPayment historyItem={historyItem} />
          </HistoryRow>
        );
      }

      return historyItem.changes.map(x => {
        const data = resolver(x);

        if (!data) {
          return null;
        }

        return <HistoryRow key={x.attribute}>{data}</HistoryRow>;
      });
    }
    default:
      return null;
  }
};
