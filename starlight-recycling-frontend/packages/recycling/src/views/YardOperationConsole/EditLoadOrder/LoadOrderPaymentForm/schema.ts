import * as Yup from 'yup';
import { paymentOrderSchemaShape } from '../../EditDumpOrder/DumpOrderPaymentForm/schema';
import { loadOrderBaseSchema } from '../loadOrderBaseSchema';

export const loadOrderPaymentSchema = Yup.object().shape({});

export const schema = loadOrderBaseSchema
  .concat(loadOrderBaseSchema)
  .concat(paymentOrderSchemaShape);
