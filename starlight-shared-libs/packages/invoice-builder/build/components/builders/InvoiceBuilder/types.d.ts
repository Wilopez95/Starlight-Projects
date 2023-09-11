import { IBuilder } from '../types';
export interface IInvoiceBuilder extends IBuilder {
    payments: number;
    invoiceNumber?: number;
}
