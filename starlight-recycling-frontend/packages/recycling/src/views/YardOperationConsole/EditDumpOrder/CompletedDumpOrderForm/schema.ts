import { arrivalOrderSchemaShape } from '../ArrivalDumpOrderForm';
import { dumpOrderBaseSchema } from '../dumpOrderBaseSchema';
import { paymentOrderSchemaShape } from '../DumpOrderPaymentForm/schema';
import { weightOutOrderSchemaShape } from '../WeightOutOrderForm';

export const schema = dumpOrderBaseSchema
  .concat(arrivalOrderSchemaShape)
  .concat(weightOutOrderSchemaShape)
  .concat(paymentOrderSchemaShape);
