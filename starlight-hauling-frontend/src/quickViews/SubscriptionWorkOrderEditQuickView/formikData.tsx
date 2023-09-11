import * as Yup from 'yup';

const lineItemShape = {
  billableLineItemId: Yup.number().required('Line item is required'),
  price: Yup.number().required('Price is required'),
  quantity: Yup.number()
    .typeError('Must be an integer')
    .positive('Must be greater than 0')
    .required('Quantity is required'),
};

export const generateValidationSchema = () =>
  Yup.object().shape({
    serviceDate: Yup.date(),
    instructionsForDriver: Yup.string().max(256, 'Please enter up to 256 characters').nullable(),
    route: Yup.string(),
    lineItems: Yup.array().of(Yup.object().shape(lineItemShape)),
  });
