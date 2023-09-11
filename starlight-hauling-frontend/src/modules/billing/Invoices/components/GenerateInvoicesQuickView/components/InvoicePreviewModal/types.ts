import { type IModal } from '../../../../../../../common/Modal/types';
import { type ICompany } from '../../../../../../../types';
import {
  type FormikCustomerWithInvoiceDrafts,
  type FormikOrderInvoiceDraft,
  type FormikSubscriptionInvoiceDraft,
} from '../../types';

export interface IInvoicePreviewModal extends IModal {
  invoiceOrderDraft: FormikOrderInvoiceDraft | null;
  invoiceSubscriptionDraft: FormikSubscriptionInvoiceDraft | null;
  currentCustomer: FormikCustomerWithInvoiceDrafts;
  currentCompany?: ICompany;
}
