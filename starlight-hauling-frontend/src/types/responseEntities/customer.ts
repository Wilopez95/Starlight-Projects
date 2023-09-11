import { CustomerStatus, PromiseStatus } from '@root/consts';

import { IBroker, ICustomer, ICustomersOnHold, ICustomersResume } from '../entities';

export interface IResponseCustomer extends ICustomer {
  owner: IBroker;
}

export interface IChangeStatusRequest {
  id: number;
  status: CustomerStatus;
  shouldUnholdTemplates?: boolean;
  reason?: string;
  reasonDescription?: string | null;
  holdSubscriptionUntil?: Date | null;
  onHoldNotifySalesRep?: boolean;
  onHoldNotifyMainContact?: boolean;
}

export interface IResponseBalances {
  customerBalances: {
    availableCredit: number;
    balance: number;
    creditLimit: number;
    nonInvoicedTotal: number;
    prepaidOnAccount: number;
    prepaidDeposits: number;
    paymentDue: number;
  };
}

export interface IBulkOnHoldRequest extends ICustomersOnHold {
  ids: Array<number>;
}

export interface IBulkOnHoldResponse {
  id: number;
  status: PromiseStatus;
  value?: IResponseCustomer;
  reason?: object;
}

export interface IBulkResumeRequest extends ICustomersResume {
  ids: Array<number>;
}

export interface IBulkResumeResponse {
  id: number;
  status: PromiseStatus;
  value?: IResponseCustomer;
  reason?: object;
}
