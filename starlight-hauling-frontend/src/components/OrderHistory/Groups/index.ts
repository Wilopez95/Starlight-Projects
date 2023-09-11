import * as Sentry from '@sentry/react';

import { resolveOrderHistoryItemLineItemGroupEvent } from './LineItemGroup';
import { resolveOrderHistoryItemOrderGroupEvent } from './OrderGroup';
import { resolveOrderHistoryItemPaymentGroupEvent } from './PaymentGroup';
import { resolveOrderHistoryItemThresholdItemGroupEvent } from './ThresholdGroup';
import { OrderHistoryItemEntityResolver } from './types';
import { resolveOrderHistoryItemWorkOrderGroupEvent } from './WorkOrderGroup';

export const resolveOrderHistoryItemEntity: OrderHistoryItemEntityResolver = entityType => {
  switch (entityType) {
    case 'ORDER': {
      return resolveOrderHistoryItemOrderGroupEvent;
    }
    case 'LINE_ITEM': {
      return resolveOrderHistoryItemLineItemGroupEvent;
    }
    case 'WORK_ORDER': {
      return resolveOrderHistoryItemWorkOrderGroupEvent;
    }
    case 'PAYMENT': {
      return resolveOrderHistoryItemPaymentGroupEvent;
    }
    case 'THRESHOLD_ITEM': {
      return resolveOrderHistoryItemThresholdItemGroupEvent;
    }
    default: {
      Sentry.captureMessage(`Unprocessed orderHistoryItemEntityType ${entityType}`);

      return () => null;
    }
  }
};
