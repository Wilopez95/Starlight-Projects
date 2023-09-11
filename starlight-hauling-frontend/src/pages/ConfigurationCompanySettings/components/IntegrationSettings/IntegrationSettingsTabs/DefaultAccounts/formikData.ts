import * as Yup from 'yup';

export const getInitialValues = () => ({
  accountReceivable: '',
  defaultAccountIncome: '',
  defaultAccountTax: '',
  defaultPaymentAccount: '',
  defaultAccountFinCharges: '',
  writeoffAccount: '',
  creditMemoAccount: '',
});

export const generateValidationSchema = () =>
  Yup.object().shape({
    accountReceivable: Yup.string().nullable(),
    defaultAccountIncome: Yup.string().nullable(),
    defaultAccountTax: Yup.string().nullable(),
    defaultPaymentAccount: Yup.string().nullable(),
    defaultAccountFinCharges: Yup.string().nullable(),
    writeoffAccount: Yup.string().nullable(),
    creditMemoAccount: Yup.string().nullable(),
  });
