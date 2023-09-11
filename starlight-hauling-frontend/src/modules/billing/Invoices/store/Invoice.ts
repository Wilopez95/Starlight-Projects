import { action, observable } from 'mobx';

import { convertSubscriptionInvoiceEntityDates } from '@root/modules/billing/Invoices/store/helpers';

import {
  convertDates,
  getInvoiceStatus,
  parseDate,
  substituteLocalTimeZoneInsteadUTC,
} from '../../../../helpers';
import { BaseEntity } from '../../../../stores/base/BaseEntity';
import { JsonConversions, Maybe } from '../../../../types';
import { IBillingCustomer } from '../../../../types/queries';
import { Payment } from '../../Payments/store/Payment';
import {
  IInvoice,
  IInvoiceBusinessLine,
  IInvoiceEmail,
  IInvoiceOrder,
  IInvoiceSubscriptionModel,
  IInvoiceSubscriptionResponse,
  InvoiceStatus,
  InvoiceType,
} from '../types';

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

  payments: Payment[];

  emails: IInvoiceEmail[];

  writeOff: boolean;

  fine: number;

  dueDate: Date | null;

  financeChargeId?: number;

  businessLines: IInvoiceBusinessLine[];

  @observable checked = false;

  status: InvoiceStatus;

  store: InvoiceStore;

  constructor(store: InvoiceStore, entity: JsonConversions<IInvoice>) {
    super(entity);

    this.type = entity.type;
    this.dueDate = entity.dueDate ? substituteLocalTimeZoneInsteadUTC(entity.dueDate) : null;
    this.csrName = entity.csrName;
    this.businessLines = entity.businessLines;
    this.csrEmail = entity.csrEmail;
    this.total = Number(entity.total);
    this.customer = convertDates(entity.customer);
    this.pdfUrl = entity.pdfUrl;
    this.balance = Number(entity.balance);
    this.writeOff = entity.writeOff;
    this.fine = entity.fine ?? 0;
    this.financeChargeId = entity.financeChargeId;
    this.createdAt = parseDate(entity.createdAt);
    this.updatedAt = parseDate(entity.updatedAt);

    this.orders =
      entity.orders?.map(order => ({
        ...order,
        serviceDate: substituteLocalTimeZoneInsteadUTC(order.serviceDate),
      })) ?? [];

    this.invoicedEntityList =
      entity.type === InvoiceType.orders
        ? ((entity.invoicedEntity as JsonConversions<IInvoiceOrder[]>)?.map(order => ({
            ...order,
            serviceDate: substituteLocalTimeZoneInsteadUTC(order.serviceDate),
          })) as IInvoiceOrder[]) ?? []
        : (
            entity.invoicedSubscriptionEntity as JsonConversions<IInvoiceSubscriptionResponse[]>
          )?.map(convertSubscriptionInvoiceEntityDates) ?? [];
    this.store = store;
    this.status = getInvoiceStatus(this);
    this.payments =
      entity.payments?.map(payment => new Payment(store.globalStore.paymentStore, payment)) ?? [];
    this.emails = entity.emails?.map(convertDates) ?? [];
  }

  @action.bound check() {
    this.checked = !this.checked;
  }
}
