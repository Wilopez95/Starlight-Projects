import { type IFormModal } from '../../../../../components/modals/types';

export interface ISearchCustomerOrInvoiceModal<T> extends IFormModal<T> {
  isPayout?: boolean;
}

export type FormikCreatePayment = {
  searchString: string;
  customerId?: number;
  invoiceId?: number;
};
