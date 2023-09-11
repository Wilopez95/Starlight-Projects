import { paymentOrderSchemaShape } from '../../EditDumpOrder/DumpOrderPaymentForm/schema';
import { arrivalLoadOrderSchema } from '../ArrivalLoadOrderForm/schema';
import { loadOrderSchema } from '../LoadOrderForm/schema';
import { loadOrderBaseSchema } from '../loadOrderBaseSchema';

export const schema = loadOrderBaseSchema
  .concat(arrivalLoadOrderSchema)
  .concat(loadOrderSchema)
  .concat(paymentOrderSchemaShape);
