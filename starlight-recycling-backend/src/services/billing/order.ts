import { enqueue } from '../queue';
import { AMQP_QUEUE_ORDER_TOTALS_TO_BILLING } from '../../config';

export interface OrderTotalEvent {
  tenantName: string;
  orderId: number;
  grandTotal: number;
  onAccountTotal: number;
  beforeTaxesTotal: number;
  overrideCreditLimit: boolean;

  // but if you want to update anything else in the order, just send it
  // because billing service directly, without any validation, sends payload to the db
}

export const sendOrderTotalEvent = (event: OrderTotalEvent): void => {
  enqueue({
    type: AMQP_QUEUE_ORDER_TOTALS_TO_BILLING,
    payload: {
      schemaName: event.tenantName,
      ...event,
    },
  });
};
