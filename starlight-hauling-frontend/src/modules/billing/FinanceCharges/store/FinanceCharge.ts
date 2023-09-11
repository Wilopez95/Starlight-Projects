import { action, observable } from 'mobx';

import { convertDates, substituteLocalTimeZoneInsteadUTC } from '../../../../helpers';
import { BaseEntity } from '../../../../stores/base/BaseEntity';
import { JsonConversions, Maybe } from '../../../../types';
import { IBillingCustomer } from '../../../../types/queries';
import { IInvoice, IInvoiceEmail } from '../../Invoices/types';
import { Payment } from '../../Payments/store/Payment';
import { IStatement } from '../../Statements/types';
import { FinanceChargeStatus, IFinanceCharge } from '../types';

import { FinanceChargeStore } from './FinanceChargeStore';

export class FinanceCharge extends BaseEntity implements IFinanceCharge {
  total: number;
  balance: number;
  customer: Maybe<IBillingCustomer>;
  pdfUrl: Maybe<string>;
  writeOff: boolean;
  status: FinanceChargeStatus;

  invoices: IInvoice[];
  payments: Payment[];
  emails: IInvoiceEmail[];
  statement?: IStatement;

  @observable checked = false;
  store: FinanceChargeStore;

  constructor(store: FinanceChargeStore, entity: JsonConversions<IFinanceCharge>) {
    super(entity);

    this.total = Number(entity.total);
    this.customer = convertDates(entity.customer);
    this.pdfUrl = entity.pdfUrl;
    this.balance = Number(entity.balance);
    this.writeOff = entity.writeOff;

    this.invoices =
      entity.invoices?.map(invoice => ({
        ...convertDates(invoice),
        dueDate: invoice.dueDate ? substituteLocalTimeZoneInsteadUTC(invoice.dueDate) : null,
      })) ?? [];
    this.payments =
      entity.payments?.map(payment => new Payment(store.globalStore.paymentStore, payment)) ?? [];
    this.emails = entity.emails?.map(convertDates) ?? [];
    this.statement = entity.statement
      ? {
          ...convertDates(entity.statement),
          statementDate: substituteLocalTimeZoneInsteadUTC(entity.statement.statementDate),
          endDate: substituteLocalTimeZoneInsteadUTC(entity.statement.endDate),
        }
      : undefined;

    this.store = store;
    this.status = this.balance > 0 ? 'open' : 'closed';
  }

  @action.bound check() {
    this.checked = !this.checked;
  }
}
