import { enqueue } from '../queue';
import { AMQP_QUEUE_CUSTOMER_JOB_SITE_TO_BILLING } from '../../config';

export interface CustomerJobSiteEvent {
  tenantName: string;
  id: number;
  jobSiteId: number;
  customerId: number;
  sendInvoicesToCustomer: boolean;
  sendInvoicesToJobSite: boolean;
  invoiceEmails: string[];
}

export const sendCustomerJobSiteUnit = ({ tenantName, ...data }: CustomerJobSiteEvent): void => {
  enqueue({
    type: AMQP_QUEUE_CUSTOMER_JOB_SITE_TO_BILLING,
    payload: {
      schemaName: tenantName,
      ...data,
    },
  });
};
