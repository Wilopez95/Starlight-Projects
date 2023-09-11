import { InvoicingType } from '@root/api';
import { IInvoicingSubscriptions } from '@root/types';

import {
  type FormikCustomerWithInvoiceDrafts,
  type FormikOrderInvoiceDraft,
  type FormikSubscriptionInvoiceDraft,
} from '../../types';

export interface IDraftOrderTable {
  orders: FormikOrderInvoiceDraft[InvoicingType.Orders];
  currentCustomer: FormikCustomerWithInvoiceDrafts;
}

export interface IDraftSubscriptionTable {
  subscriptions: FormikSubscriptionInvoiceDraft[InvoicingType.Subscriptions];
  currentCustomer: FormikCustomerWithInvoiceDrafts;
}

export interface IDraftSubscriptionRow {
  subscription: IInvoicingSubscriptions;
  currentCustomerId: number;
}

export type BaseOrderTable = {
  withCheckboxes?: boolean;
  withRadioButtons?: boolean;
  currentCustomer: FormikCustomerWithInvoiceDrafts;
};

type StaticOverlimitTable = BaseOrderTable & {
  withCheckboxes?: false;
  withRadioButtons?: undefined;
  selectedOrders?: undefined;
  onAllChecked?: undefined;
  onOrdersChecked?: undefined;
};

type OverlimitTableWithCheckboxes = BaseOrderTable & {
  withCheckboxes: true;
  withRadioButtons?: undefined;
  selectedOrders: number[];
  onAllChecked(): void;
  onOrderChecked(orderId: number): void;
};

type StaticOverpaidTable = BaseOrderTable & {
  withRadioButtons?: false;
  selectedOrders?: undefined;
  onAllChecked?: undefined;
  onOrdersChecked?: undefined;
};

type OverpaidTableWithRadioButtons = BaseOrderTable & {
  withRadioButtons: true;
  selectedOrder: number;
  onOrderSelected(orderId: number): void;
};

export type OverlimitTableProps = StaticOverlimitTable | OverlimitTableWithCheckboxes;
export type OverpaidTableProps = StaticOverpaidTable | OverpaidTableWithRadioButtons;
