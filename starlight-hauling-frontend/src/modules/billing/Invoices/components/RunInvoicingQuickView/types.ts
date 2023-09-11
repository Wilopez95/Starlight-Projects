import { ICustomQuickView } from '@root/common/QuickView';

import { type IOrderInvoicingRequest } from '../../../../../api';
import { GenerateInvoicesRequest } from '../../types';

export interface IRunInvoicingQuickView extends ICustomQuickView {
  onInvoicesSave(data: GenerateInvoicesRequest): void;
}

export interface IRunInvoicingQuickViewContent {
  onInvoicesSave(data: GenerateInvoicesRequest): void;
}

type InvoiceTarget = 'all' | 'specific';

export type FormikRunInvoicing = IOrderInvoicingRequest & {
  invoiceTarget: InvoiceTarget;
};
