import { enqueue } from '../queue';
import { AMQP_QUEUE_WORK_ORDERS_TO_CORE } from '../../config';

export interface WeightTicketToHaulingParams {
  recyclingOrderId: number;
  haulingOrderId: number | null;
  recyclingTenantName: string;
  haulingTenantName: string;
  businessUnitId: string | number;
}

export const weightTicketToHauling = ({
  recyclingOrderId,
  haulingOrderId,
  recyclingTenantName,
  haulingTenantName,
  businessUnitId,
}: WeightTicketToHaulingParams): void => {
  enqueue({
    type: AMQP_QUEUE_WORK_ORDERS_TO_CORE,
    payload: {
      recyclingOrderId,
      haulingOrderId,
      recyclingTenantName,
      haulingTenantName,
      businessUnitId,
    },
  });
};
