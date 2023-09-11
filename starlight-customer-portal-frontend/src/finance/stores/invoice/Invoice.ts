import { action, observable } from 'mobx';

import { convertDates, parseDate } from '@root/core/helpers';
import { BaseEntity } from '@root/core/stores/base/BaseEntity';
import { JsonConversions, Maybe } from '@root/core/types';
import { getInvoiceStatus } from '@root/finance/helpers';
import { Payment } from '@root/finance/stores/payment/Payment';
import {
  IInvoice,
  IInvoiceBusinessLine,
  IInvoiceEmail,
  IInvoiceOrder,
  IInvoiceSubscriptionModel,
  IInvoiceSubscriptionResponse,
  InvoiceStatus,
  InvoiceType,
} from '@root/finance/types/entities';
import { IBillingCustomer } from '@root/finance/types/queries';

import { convertSubscriptionInvoiceEntityDates } from '../helpers';

import { InvoiceStore } from './InvoiceStore';

export class Invoice extends BaseEntity implements IInvoice {
  type: InvoiceType;
  csrName: string;
  csrEmail: string;
  total: number;
  balance: number;
  customer: Maybe<IBillingCustomer>;
  pdfUrl: Maybe<string>;
  // todo: remove after backend move to use unions only
  orders: IInvoiceOrder[];
  invoicedEntityList?: IInvoiceOrder[] | IInvoiceSubscriptionModel[];
  payments: any[]; // todo: set type
  emails: IInvoiceEmail[];
  writeOff: boolean;
  fine: number;
  dueDate: Date | null;
  businessLines: IInvoiceBusinessLine[];

  @observable checked = false;
  status: InvoiceStatus;
  store: InvoiceStore;

  constructor(store: InvoiceStore, entity: JsonConversions<IInvoice>) {
    super(entity);

    this.type = entity.type;
    this.dueDate = entity.dueDate ? parseDate(entity.dueDate) : null;
    this.businessLines = entity.businessLines;
    this.csrName = entity.csrName;
    this.csrEmail = entity.csrEmail;
    this.total = Number(entity.total);
    this.customer = convertDates(entity.customer);
    this.pdfUrl = entity.pdfUrl;
    this.balance = Number(entity.balance);
    this.writeOff = entity.writeOff;
    this.fine = entity.fine ?? 0;

    this.orders =
      entity.orders?.map((order) => ({
        ...order,
        serviceDate: parseDate(order.serviceDate),
      })) ?? [];
    this.payments =
      entity.payments?.map((payment) => new Payment(store.globalStore.paymentStore, payment)) ?? [];

    this.invoicedEntityList =
      entity.type === InvoiceType.orders
        ? ((entity.invoicedEntity as JsonConversions<IInvoiceOrder[]>)?.map((order) => ({
            ...order,
            serviceDate: parseDate(order.serviceDate),
          })) as IInvoiceOrder[]) ?? []
        : (entity.invoicedEntity as JsonConversions<IInvoiceSubscriptionResponse[]>)?.map(
            convertSubscriptionInvoiceEntityDates,
          ) ?? [];

    this.store = store;
    this.status = getInvoiceStatus(this);
    this.emails = entity.emails?.map(convertDates) ?? [];
  }

  @action.bound check() {
    this.checked = !this.checked;
  }
}
