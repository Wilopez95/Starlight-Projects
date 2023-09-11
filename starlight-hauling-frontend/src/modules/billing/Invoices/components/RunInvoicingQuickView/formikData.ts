import * as Yup from 'yup';

import { billingCycles } from '@root/consts';

import { type FormikRunInvoicing } from './types';

export const validationSchema = Yup.object().shape({
  endingDate: Yup.date(),
  invoiceTarget: Yup.string(),
  customerId: Yup.number().when('invoiceTarget', {
    is: val => val === 'specific',
    then: Yup.number().required('Customer is required'),
  }),
  customerGroupId: Yup.number().when('invoiceTarget', {
    is: val => val === 'all',
    then: Yup.number().required('Customer group is required'),
  }),
});

export const defaultValue: FormikRunInvoicing = {
  endingDate: new Date(),
  invoiceTarget: 'all',
  customerId: undefined,
  customerGroupId: 0,
  billingCycles,
  prepaid: true,
  onAccount: true,
};
