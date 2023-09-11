import { camelCase } from 'lodash-es';
import { action, observable } from 'mobx';

import { BillableItemType } from '@root/core/consts';
import { convertDates, parseDate } from '@root/core/helpers';
import { BaseEntity } from '@root/core/stores/base/BaseEntity';
import { ICreditCard, JsonConversions, Maybe } from '@root/core/types';
import { ICustomer } from '@root/customer/types';
import {
  GeneralPayment,
  IAppliedInvoice,
  InvoicedStatus,
  IOrder,
  PaymentStatus,
  PaymentType,
  ReverseData,
} from '@root/finance/types/entities';

import type { PaymentStore } from './PaymentStore';

export class Payment extends BaseEntity implements GeneralPayment {
  status: PaymentStatus;
  invoicedStatus: InvoicedStatus;
  isAch: boolean;
  date: Date;
  paymentType: PaymentType;
  amount: number;
  sendReceipt: boolean;
  creditCard: Maybe<ICreditCard>;
  customer: ICustomer;
  invoices: IAppliedInvoice[];
  checkNumber?: string;
  prevBalance?: number;
  newBalance?: number;
  appliedAmount?: number;
  unappliedAmount?: number;
  reverseData?: ReverseData;
  refundedAmount?: number;
  refundedOnAccountAmount?: number;
  memoNote?: string;
  writeOffNote?: string;
  orders?: IOrder[];
  deferredUntil?: Date;
  originalPaymentId?: string;
  billableItemId?: number;
  billableItemType?: BillableItemType;

  store: PaymentStore;

  @observable checked = false;

  constructor(store: PaymentStore, entity: JsonConversions<GeneralPayment>) {
    super(entity);

    this.store = store;

    // TODO: remove camelCase after full apollo migration
    this.status = camelCase(entity.status) as PaymentStatus;
    this.invoicedStatus = (camelCase(entity.invoicedStatus) as InvoicedStatus) || 'unapplied';
    this.isAch = entity.isAch;
    this.paymentType = camelCase(entity.paymentType) as PaymentType;
    this.originalPaymentId = entity.originalPaymentId;
    this.amount = entity.amount;
    this.sendReceipt = entity.sendReceipt;
    this.checkNumber = entity.checkNumber;
    this.date = parseDate(entity.date);
    this.prevBalance = entity.prevBalance;
    this.newBalance = entity.newBalance;
    this.appliedAmount = entity.appliedAmount;
    this.unappliedAmount = entity.unappliedAmount;
    this.creditCard = convertDates(entity.creditCard);

    this.memoNote = entity.memoNote;
    this.writeOffNote = entity.writeOffNote;
    this.customer = convertDates(entity.customer);
    this.invoices =
      entity.invoices?.map((invoice) => ({
        ...convertDates(invoice),

        dueDate: invoice.dueDate ? parseDate(invoice.dueDate) : null,
      })) ?? [];

    if (entity.reverseData) {
      this.reverseData = {
        ...entity.reverseData,
        date: parseDate(entity.reverseData?.date),
      };
    }

    this.refundedAmount = entity.refundedAmount;
    this.refundedOnAccountAmount = entity.refundedOnAccountAmount;

    this.billableItemId = entity.billableItemId;
    this.billableItemType = entity.billableItemType;

    if (entity.deferredUntil) {
      this.deferredUntil = parseDate(entity.deferredUntil);
    }
    if (entity.orders) {
      this.orders = entity.orders.map((order) =>
        Object.assign(convertDates(order), { serviceDate: parseDate(order.serviceDate) }),
      );
    }
  }

  @action.bound check() {
    this.checked = !this.checked;
  }
}
