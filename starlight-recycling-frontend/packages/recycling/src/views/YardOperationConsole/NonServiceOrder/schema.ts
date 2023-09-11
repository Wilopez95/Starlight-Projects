import { paymentOrderSchemaShape } from '../EditDumpOrder/DumpOrderPaymentForm/schema';
import { commonOrderBaseSchema } from '../commonOrderBaseSchema';

export const schema = commonOrderBaseSchema.concat(paymentOrderSchemaShape);
