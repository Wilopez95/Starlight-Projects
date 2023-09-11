import { omitBy, isNull } from 'lodash';
import { enqueue } from '../queue';
import { AMQP_QUEUE_COMPANIES } from '../../config';

export interface CompanyEvent {
  tenantId: number;
  logoUrl: string | null;
  physicalAddressLine1: string | null;
  physicalAddressLine2: string | null;
  physicalCity: string | null;
  physicalState: string | null;
  physicalZip: string | null;
  domain: string | null;
}

export const sendCompanyEvent = (event: CompanyEvent): void => {
  enqueue({
    type: AMQP_QUEUE_COMPANIES,
    payload: omitBy(event, isNull),
  });
};
