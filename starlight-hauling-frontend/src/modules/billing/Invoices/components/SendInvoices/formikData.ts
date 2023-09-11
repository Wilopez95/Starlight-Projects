import * as Yup from 'yup';

import { type ISendInvoicesData } from './types';

export const generateValidationSchema = (singleCustomer: boolean) =>
  Yup.object().shape({
    customerEmails: Yup.string().test(
      'required',
      'Email is required',
      val => !singleCustomer || !!val,
    ),
  });

const defaultValue: ISendInvoicesData = {
  attachMediaEnabled: false,
  invoiceIds: [],
  customerEmails: ['sendToCustomerInvoiceEmails'],
  sendToCustomerInvoiceEmails: true,
};

export const getValues = (invoiceIds: number[]): ISendInvoicesData => {
  return { ...defaultValue, invoiceIds };
};
