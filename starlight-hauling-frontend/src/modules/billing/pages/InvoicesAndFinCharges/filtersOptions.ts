import { CustomerPaymentType } from '@root/types';

import { InvoiceAge, InvoiceStatusEnum } from '../../Invoices/types';

export const commonStatusOptions = [
  { label: 'Open', value: InvoiceStatusEnum.open },
  { label: 'Closed', value: InvoiceStatusEnum.closed },
];

export const invoiceStatusOptions = [
  { label: 'Write Off', value: InvoiceStatusEnum.writeOff },
  { label: 'Overdue', value: InvoiceStatusEnum.overdue },
];

export const customerPaymentTypeOptions = [
  { label: 'Prepaid', value: CustomerPaymentType.PREPAID },
  { label: 'On Account', value: CustomerPaymentType.ON_ACCOUNT },
];

export const invoiceAgeOptions = [
  { label: 'Current', value: InvoiceAge.CURRENT },
  {
    label: '31-60',
    value: InvoiceAge.OVERDUE_31_DAYS,
  },
  {
    label: '61-90',
    value: InvoiceAge.OVERDUE_61_DAYS,
  },
  {
    label: '91+',
    value: InvoiceAge.OVERDUE_91_DAYS,
  },
];
