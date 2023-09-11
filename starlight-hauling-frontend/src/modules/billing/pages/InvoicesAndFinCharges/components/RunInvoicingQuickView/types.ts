import { ICommonInvoicingRequest } from '../../../../../../api';
import { ICustomQuickView } from '../../../../../../common';
import { GenerateInvoicesRequest } from '../../../../types';

export interface IRunInvoicingQuickView extends ICustomQuickView {
  onInvoicesSave(data: GenerateInvoicesRequest): void;
}

export interface IRunInvoicingQuickViewContent {
  onInvoicesSave(data: GenerateInvoicesRequest): void;
}

export enum InvoiceTargetEnum {
  all = 'all',
  specific = 'specific',
}

export type FormikRunInvoicing = ICommonInvoicingRequest & {
  invoiceTarget: InvoiceTargetEnum;
};
