import { enqueue } from '../queue';
import { AMQP_QUEUE_BUSINESS_UNITS } from '../../config';

export interface BusinessUnitEvent {
  tenantId: number;
  tenantName: string;
  loginUrl: string | null;
  id: number;
  nameLine1: string | null;
  active: boolean;
  timeZoneName: string | null;
  logoUrl: string | null;
  type: string;
}

export const sendBusinessUnit = ({ tenantName, ...data }: BusinessUnitEvent): void => {
  enqueue({
    type: AMQP_QUEUE_BUSINESS_UNITS,
    payload: {
      tenantName: tenantName,
      schemaName: tenantName,
      ...data,
    },
  });
};
