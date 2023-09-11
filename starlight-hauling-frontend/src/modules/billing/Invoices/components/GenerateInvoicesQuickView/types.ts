import {
  type CustomerWithCommonInvoiceDrafts,
  type IInvoicingRequest,
  type RunInvoicingResponse,
  IInvoicesUnion,
} from '../../../../../api';
import {
  type IOrdersInvoiceDraft,
  type IOverlimitOrder,
  type IOverpaidOrder,
  ISubscriptionsInvoiceDraft,
} from '../../../../../types';
import { GenerateInvoicesRequest } from '../../types';

export interface IGenerateInvoicesQuickView {
  businessUnitId: string;
  processedOrdersCount: number;
  processedSubscriptionsCount?: number;
  isOpen: boolean;
  invoicingOptions?: IInvoicingRequest;
  mode?: GenerateInvoicingMode;
  onInvoicesSave(data: GenerateInvoicesRequest): void;
  backToOptions(): void;
  onCloseInvoicing(): void;
}

export interface IGenerateInvoicesQuickViewContent {
  businessUnitId: string;
  processedOrdersCount: number;
  processedSubscriptionsCount?: number;
  invoicingOptions?: IInvoicingRequest;
  mode?: GenerateInvoicingMode;
  onInvoicesSave(data: GenerateInvoicesRequest): void;
  backToOptions(): void;
  onCloseInvoicing(): void;
}

export enum GenerateInvoicingMode {
  Orders = 'Orders',
  OrdersAndSubscriptions = 'OrdersAndSubscriptions',
}

export type FormikOrderInvoiceDraft = IOrdersInvoiceDraft & {
  attachMediaPref: boolean;
  attachTicketPref: boolean;
};

export type FormikSubscriptionInvoiceDraft = ISubscriptionsInvoiceDraft & {
  attachMediaPref: boolean;
};

export type FormikCustomerWithInvoiceDrafts = Omit<
  CustomerWithCommonInvoiceDrafts,
  'drafts' | 'overlimitOrders' | 'overpaidOrders'
> & {
  drafts: IInvoicesUnion<FormikOrderInvoiceDraft, FormikSubscriptionInvoiceDraft>;
  overlimitOrders: Record<string, IOverlimitOrder>;
  overpaidOrders: Record<string, IOverpaidOrder>;
};

export type FormikInvoicingData = Omit<RunInvoicingResponse, 'onAccount' | 'prepaid'> & {
  onAccount: FormikCustomerWithInvoiceDrafts[];
  prepaid: FormikCustomerWithInvoiceDrafts[];
};
