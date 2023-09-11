import { resolveOrderHistoryItemOrderGroupEvent } from './OrderGroup';
import { OrderHistoryItemEntityResolver } from './types';
import { resolveOrderHistoryItemWorkOrderGroupEvent } from './WorkOrderGroup';
import { resolveOrderHistoryItemPaymentGroupEvent } from './PaymentGroup';
import { resolveOrderHistoryItemThresholdItemGroupEvent } from './ThresholdGroup';
import { resolveOrderHistoryItemLineItemGroupEvent } from './LineItemGroup';

export const resolveOrderHistoryItemEntity: OrderHistoryItemEntityResolver = (entityType) => {
  switch (entityType) {
    case 'ORDER': {
      return resolveOrderHistoryItemOrderGroupEvent;
    }
    case 'WORK_ORDER': {
      return resolveOrderHistoryItemWorkOrderGroupEvent;
    }
    case 'LINE_ITEM': {
      return resolveOrderHistoryItemLineItemGroupEvent;
    }
    case 'PAYMENT': {
      return resolveOrderHistoryItemPaymentGroupEvent;
    }
    case 'THRESHOLD_ITEM': {
      return resolveOrderHistoryItemThresholdItemGroupEvent;
    }
    default: {
      return () => null;
    }
  }
};
