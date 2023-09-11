import { camelCase } from 'lodash-es';
import { action, observable } from 'mobx';

import { BillableItemType } from '../../../../consts';
import { convertDates, substituteLocalTimeZoneInsteadUTC } from '../../../../helpers';
import { BaseEntity } from '../../../../stores/base/BaseEntity';
import { type ICustomer, type IOrder, type JsonConversions, type Maybe } from '../../../../types';
import { ICreditCard } from '../../CreditCards/types';
import { IAppliedInvoice } from '../../Invoices/types';
import { GeneralPayment, InvoicedStatus, PaymentStatus, PaymentType, ReverseData } from '../types';

import { type PaymentStore } from './PaymentStore';

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
  isEditable?: boolean;
  isPrepay?: boolean;
  checkNumber?: string;
  prevBalance?: number;
  newBalance?: number;
  appliedAmount?: number;
  unappliedAmount?: number;
  reverseData?: ReverseData;
  refundedAmount?: number;
  refundedOnAccountAmount?: number;
  paidOutAmount?: number;
  memoNote?: string;
  writeOffNote?: string;
  orders?: IOrder[];
  deferredUntil?: Date;
  originalPaymentId?: string;
  billableItemId?: number;
  billableItemType?: BillableItemType;
  bankDepositDate?: Maybe<Date>;

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
    this.date = substituteLocalTimeZoneInsteadUTC(entity.date);
    this.prevBalance = entity.prevBalance;
    this.newBalance = entity.newBalance;
    this.appliedAmount = entity.appliedAmount;
    this.unappliedAmount = entity.unappliedAmount;
    this.creditCard = convertDates(entity.creditCard);
    this.isEditable = entity.isEditable;
    this.isPrepay = entity.isPrepay;
    this.bankDepositDate = entity.bankDepositDate
      ? substituteLocalTimeZoneInsteadUTC(entity.bankDepositDate)
      : null;

    this.memoNote = entity.memoNote;
    this.paidOutAmount = entity.paidOutAmount;
    this.writeOffNote = entity.writeOffNote;
    this.customer = convertDates(entity.customer);
    this.invoices =
      entity.invoices?.map(invoice => ({
        ...convertDates(invoice),
        dueDate: invoice.dueDate ? substituteLocalTimeZoneInsteadUTC(invoice.dueDate) : null,
      })) ?? [];

    if (entity.reverseData) {
      this.reverseData = {
        ...entity.reverseData,
        date: substituteLocalTimeZoneInsteadUTC(entity.reverseData?.date),
      };
    }

    this.refundedAmount = entity.refundedAmount;
    this.refundedOnAccountAmount = entity.refundedOnAccountAmount;

    this.billableItemId = entity.billableItemId;
    this.billableItemType = entity.billableItemType;

    if (entity.deferredUntil) {
      this.deferredUntil = substituteLocalTimeZoneInsteadUTC(entity.deferredUntil);
    }
    if (entity.orders) {
      this.orders = entity.orders.map(order =>
        Object.assign(convertDates(order), {
          serviceDate: substituteLocalTimeZoneInsteadUTC(order.serviceDate),
        }),
      );
    }
  }

  @action.bound check() {
    this.checked = !this.checked;
  }
}
