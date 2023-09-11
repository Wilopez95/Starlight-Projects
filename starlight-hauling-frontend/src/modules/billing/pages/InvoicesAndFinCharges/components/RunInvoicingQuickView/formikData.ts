import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { billingCycles } from '@root/consts';

import { type FormikRunInvoicing, InvoiceTargetEnum } from './types';

const I18N_PATH = 'pages.Invoices.RunInvoicingMenu.';

export const validationSchema = (t: TFunction) =>
  Yup.object().shape({
    endingDate: Yup.date(),
    invoiceTarget: Yup.string(),
    customerId: Yup.number().when('invoiceTarget', {
      is: val => val === InvoiceTargetEnum.specific,
      then: Yup.number().required(t(`${I18N_PATH}CustomerIsRequired`)),
    }),
    customerGroupId: Yup.number().when('invoiceTarget', {
      is: val => val === InvoiceTargetEnum.specific,
      then: Yup.number().required(t(`${I18N_PATH}CustomerGroupIsRequired`)),
    }),
  });

export const defaultValue: FormikRunInvoicing = {
  billingDate: new Date(),
  invoiceTarget: InvoiceTargetEnum.all,
  billingCycles,
  prepaid: true,
  onAccount: true,
  businessLineIds: [],
  inAdvance: true,
  arrears: true,
  customerGroupId: 0,
};
