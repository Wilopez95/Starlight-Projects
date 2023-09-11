import { camelCase } from 'lodash-es';

import { convertDates, substituteLocalTimeZoneInsteadUTC } from '../../../../helpers';
import { BaseEntity } from '../../../../stores/base/BaseEntity';
import { type ICustomer, type JsonConversions, type Maybe } from '../../../../types';
import { type ICreditCard } from '../../CreditCards/types';
import { Payment } from '../../Payments/store/Payment';
import { InvoicedStatus, PaymentStatus, PaymentType } from '../../Payments/types';
import { IPayout } from '../types';

import { type PayoutStore } from './PayoutStore';

export class Payout extends BaseEntity implements IPayout {
  amount: number;
  date: Date;
  status: PaymentStatus;
  invoicedStatus: InvoicedStatus;
  sendReceipt: boolean;
  isAch: boolean;
  appliedAmount: number;
  creditCard: Maybe<ICreditCard>;
  prevBalance: number;
  paymentType: PaymentType;
  payments: Payment[];
  customer: ICustomer;
  checkNumber?: string;
  newBalance?: number;
  unappliedAmount?: number;
  isEditable?: boolean;
  isPrepay?: boolean;
  store: PayoutStore;

  constructor(store: PayoutStore, entity: JsonConversions<IPayout>) {
    super(entity);

    this.store = store;

    this.paymentType = camelCase(entity.paymentType) as PaymentType;
    this.amount = entity.amount;
    this.status = entity.status;
    this.invoicedStatus = entity.invoicedStatus;
    this.sendReceipt = entity.sendReceipt;
    this.isAch = entity.isAch;
    this.isEditable = entity.isEditable;
    this.isPrepay = entity.isPrepay;
    this.appliedAmount = entity.appliedAmount;
    this.creditCard = convertDates(entity.creditCard);
    this.checkNumber = entity.checkNumber;

    this.date = substituteLocalTimeZoneInsteadUTC(entity.date);
    this.prevBalance = entity.prevBalance;
    this.customer = convertDates(entity.customer);

    this.payments =
      entity.payments?.map(payment => new Payment(store.globalStore.paymentStore, payment)) ?? [];
  }
}
