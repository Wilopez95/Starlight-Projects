import { Point } from 'geojson';

import { BillingCycleEnum } from '@root/consts';
import { IAddress, ICustomer, IPurchaseOrder } from '@root/types';

export interface INewCustomerData
  extends Omit<
    ICustomer,
    'createdAt' | 'updatedAt' | 'billingCycle' | 'invoiceEmails' | 'purchaseOrders'
  > {
  commercial: boolean;
  searchString: string;
  billingAddress: IAddress & {
    billingAddressSameAsMailing?: boolean;
  };
  createAndLinkJobSite: boolean;
  sendInvoicesByPost: boolean;
  sendInvoicesByEmail: boolean;
  statementSameAsInvoiceEmails: boolean;
  notificationSameAsInvoiceEmails: boolean;
  invoiceEmails: string[];
  purchaseOrders?: IPurchaseOrder[] | null;
  defaultPurchaseOrders?: number[] | null;
  location?: Point;
  phoneNumber?: string;
  billingCycle?: BillingCycleEnum;
}
