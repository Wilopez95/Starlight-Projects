import * as Yup from 'yup';

import { type FormikCreatePayment } from './types';

export const validationSchema = Yup.object().shape({
  searchString: Yup.string(),
});

export const defaultValue: FormikCreatePayment = {
  searchString: '',
  customerId: undefined,
  invoiceId: undefined,
};
