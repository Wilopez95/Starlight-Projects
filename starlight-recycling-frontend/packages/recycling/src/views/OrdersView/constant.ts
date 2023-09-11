import { OrderStatus, OrderType, PaymentMethodType } from '../../graphql/api';
import i18n from '../../i18n';
import { LabelVariant } from '../../components/Label';

export enum OrderPath {
  Completed = 'completed',
  Approved = 'approved',
  Finalized = 'finalized',
  Invoiced = 'invoiced',
}

export const orderTypeTranslationMapping = {
  [OrderType.Dump]: i18n.t('Dump'),
  [OrderType.Load]: i18n.t('Load'),
  [OrderType.NonService]: i18n.t('N/S'),
};

export const orderStatuses = [
  OrderStatus.Completed,
  OrderStatus.Approved,
  OrderStatus.Finalized,
  OrderStatus.Invoiced,
];

export const paymentMethodTranslationMapping = {
  [PaymentMethodType.Cash]: i18n.t('Cash'),
  [PaymentMethodType.Check]: i18n.t('Check'),
  [PaymentMethodType.CreditCard]: i18n.t('Credit Card'),
  [PaymentMethodType.OnAccount]: i18n.t('On Account'),
};

export const nextOrderStatus: Record<
  OrderStatus.Completed | OrderStatus.Approved | OrderStatus.Finalized,
  OrderStatus.Approved | OrderStatus.Finalized | OrderStatus.Invoiced
> = {
  [OrderStatus.Completed]: OrderStatus.Approved,
  [OrderStatus.Approved]: OrderStatus.Finalized,
  [OrderStatus.Finalized]: OrderStatus.Invoiced,
};

export const prevOrderStatus: Record<
  OrderStatus.Finalized | OrderStatus.Approved,
  OrderStatus.Completed | OrderStatus.Approved
> = {
  [OrderStatus.Finalized]: OrderStatus.Approved,
  [OrderStatus.Approved]: OrderStatus.Completed,
};

export const defaultCountByStatus = {
  all: 0,
  IN_YARD: 0,
  LOAD: 0,
  PAYMENT: 0,
  WEIGHT_OUT: 0,
  COMPLETED: 0,
  APPROVED: 0,
  FINALIZED: 0,
  INVOICED: 0,
  ON_THE_WAY: 0,
};

export const orderStatusMapping = {
  [OrderStatus.InYard]: 'IN_YARD',
  [OrderStatus.Load]: 'LOAD',
  [OrderStatus.Payment]: 'PAYMENT',
  [OrderStatus.WeightOut]: 'WEIGHT_OUT',
  [OrderStatus.Completed]: 'COMPLETED',
  [OrderStatus.Approved]: 'APPROVED',
  [OrderStatus.Finalized]: 'FINALIZED',
  [OrderStatus.Invoiced]: 'INVOICED',
  [OrderStatus.OnTheWay]: 'ON_THE_WAY',
};

export const orderPathByStatusMapping = {
  [OrderStatus.Completed]: OrderPath.Completed,
  [OrderStatus.Approved]: OrderPath.Approved,
  [OrderStatus.Finalized]: OrderPath.Finalized,
  [OrderStatus.Invoiced]: OrderPath.Invoiced,
  [OrderStatus.InYard]: 'IN_YARD',
  [OrderStatus.Load]: 'LOAD',
  [OrderStatus.Payment]: 'PAYMENT',
  [OrderStatus.WeightOut]: 'WEIGHT_OUT',
  [OrderStatus.OnTheWay]: 'ON_THE_WAY',
};

export const orderStatusByPathMapping = {
  [OrderPath.Completed]: OrderStatus.Completed,
  [OrderPath.Approved]: OrderStatus.Approved,
  [OrderPath.Finalized]: OrderStatus.Finalized,
  [OrderPath.Invoiced]: OrderStatus.Invoiced,
};

export const orderStatusLabelMapping: Record<OrderStatus, LabelVariant> = {
  [OrderStatus.Completed]: 'orange',
  [OrderStatus.Approved]: 'lightBlue',
  [OrderStatus.Finalized]: 'blue',
  [OrderStatus.Invoiced]: 'active',
  [OrderStatus.InYard]: 'active',
  [OrderStatus.Load]: 'active',
  [OrderStatus.Payment]: 'active',
  [OrderStatus.WeightOut]: 'active',
  [OrderStatus.OnTheWay]: 'active',
};

// Prevent submit form after following fields is changed
export const preventFromSubmitFilterFields = ['PONumber', 'balance'];

export const orderHighlightColumns = [
  'material.description',
  'customer.businessName',
  'ticketNumber',
  'total',
  'WONumber',
  'customerTruck.truckNumber',
];
