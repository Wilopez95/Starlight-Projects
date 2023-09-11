import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

import { enqueue } from '../queue';
import { AMQP_QUEUE_CUSTOMERS_TO_BILLING, BILLING_SERVICE_API_URL } from '../../config';

import {
  APR_TYPE,
  BILLING_CYCLE,
  INVOICE_CONSTRUCTION,
  PAYMENT_TERM,
} from '../core/types/HaulingCustomer';
import Me from '../../types/Me';
import { parseFacilitySrn } from '../../utils/srn';
import { createToken } from '../../utils/serviceToken';
import { QueryContext } from '../../types/QueryContext';
import { api, Balances } from './graphql/api';

export interface CustomerEvent {
  /**
   * required
   */
  schemaName: string;

  // required: [
  //   'id',
  //   'invoiceConstruction',
  //   'onAccount',
  //   'addFinanceCharges',
  //   'mailingAddressLine1',
  //   'mailingCity',
  //   'mailingZip',
  //   'mailingState',
  //   'billingAddressLine1',
  //   'billingCity',
  //   'billingZip',
  //   'billingState',
  //   'sendInvoicesByEmail',
  //   'sendInvoicesByPost',
  //   'attachTicketPref',
  //   'attachMediaPref',
  // ],

  id: number;
  businessUnitId: number;
  name: string;

  businessName: string | null;
  firstName: string | null;
  lastName: string | null;

  invoiceConstruction: INVOICE_CONSTRUCTION;
  onAccount: boolean;
  billingCycle: BILLING_CYCLE | null;
  paymentTerms: PAYMENT_TERM | null;
  addFinanceCharges: boolean;

  aprType: APR_TYPE | null;
  financeCharge: string | null;

  /**
   * minLength: 1
   */
  mailingAddressLine1: string;
  mailingAddressLine2: string | null;
  /**
   * minLength: 1
   */
  mailingCity: string;
  mailingState: string;
  /**
   * minLength: 5
   */
  mailingZip: string;

  /**
   * minLength: 1
   */
  billingAddressLine1: string;
  billingAddressLine2: string | null;
  /**
   * minLength: 1
   */
  billingCity: string;
  billingState: string;
  /**
   * minLength: 5
   */
  billingZip: string;

  ccProfileId: number | null;

  creditLimit: number | null;
  balance: number | null;

  sendInvoicesByEmail: boolean;
  sendInvoicesByPost: boolean;
  attachTicketPref: boolean;
  attachMediaPref: boolean;
  invoiceEmails: string[] | null;
  statementEmails: string[] | null;
  notificationEmails: string[] | null;
  mainPhoneNumber: string | null;
}

export const getCustomer = async (id: number, userInfo: Me): Promise<CustomerEvent> => {
  const { tenantName } = parseFacilitySrn(userInfo?.resource ?? '');

  const CustomerResponse = await axios.get<CustomerEvent>(
    `${BILLING_SERVICE_API_URL}/v1/customers/${id}`,
    {
      headers: {
        Authorization: `ServiceToken ${await createToken(
          {
            subscriberName: tenantName,
            permissions: userInfo.permissions,
          },
          { audience: 'billing', subject: 'recycling', requestId: uuidv4() },
        )}`,
      },
    },
  );

  return CustomerResponse.data;
};

export const sendCustomerEvent = (event: Partial<CustomerEvent>): void => {
  enqueue({
    type: AMQP_QUEUE_CUSTOMERS_TO_BILLING,
    payload: event,
  });
};

export const getCustomerBalances = async (
  ctx: QueryContext,
  customerId: string,
): Promise<Balances | null> => {
  if (!ctx.userInfo.resource) {
    throw new Error('Failed to get resource from context');
  }

  // this logic possibly needs extraction
  const { tenantName } = parseFacilitySrn(ctx.userInfo.resource);

  const token = await createToken(
    {
      schemaName: tenantName,
      subscriberName: tenantName,
      permissions: ['recycling:Customer:view'],
    },
    {
      audience: 'billing',
      subject: 'recycling',
      requestId: ctx.reqId,
    },
  );

  const Authorization = `ServiceToken ${token}`;

  try {
    const { customerBalances } = await api.getCustomerBalances({ customerId }, { Authorization });

    return customerBalances ?? null;
  } catch (e) {
    ctx.log.error(e);

    return null;
  }
};
