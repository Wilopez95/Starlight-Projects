import { enqueue } from '../queue';
import { BILLING_TENANTS_QUEUE } from '../../config';

export interface TenantEvent {
  id: number;
  name: string;
  legalName: string;
}

export const sendTenantEvent = (event: TenantEvent): void => {
  enqueue({
    type: BILLING_TENANTS_QUEUE,
    payload: event,
  });
};
