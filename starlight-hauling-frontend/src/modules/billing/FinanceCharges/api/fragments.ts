import { InvoiceFragment } from '../../Invoices/api/fragments';
import { PaymentFragment } from '../../Payments/api/fragments';
import { StatementFragment } from '../../Statements/api/fragments';

export const FinanceChargeFragment = `
  id
  customer {
    id
    name
    onAccount
  }
  pdfUrl
  exagoPath
  total
  balance
  createdAt
`;

export const FinanceChargeFragmentCustomer = `
  onAccount
  name
  id
`;

export const FinanceChargeResultFragment = `
  customersCount
  invoicesCount
  invoicesTotal
`;

// fragment detailedFinanceCharge on FinanceCharge
export const DetailedFinanceChargeFragment = `
  ${FinanceChargeFragment}
  invoices {
    ${InvoiceFragment}
    fine
  }
  payments {
    ${PaymentFragment}
  }
  emails {
    id
    status
    receiver
    createdAt
  }
  statement {
    ${StatementFragment}
  }
`;
