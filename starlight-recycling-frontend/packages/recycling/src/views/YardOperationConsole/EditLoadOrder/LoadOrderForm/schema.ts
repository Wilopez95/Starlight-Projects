import * as Yup from 'yup';
import i18n from '../../../../i18n';
import { loadOrderBaseSchema } from '../loadOrderBaseSchema';
import { weightOutOrderSchemaShape } from '../../EditDumpOrder/WeightOutOrderForm';
import { tareSchema } from '../../schemas/tareSchema';

export const loadOrderSchema = Yup.object()
  .shape({
    material: Yup.object().typeError(i18n.t('Required')).required(i18n.t('Required')),
  })
  .concat(weightOutOrderSchemaShape);

export const schema = loadOrderBaseSchema.concat(loadOrderSchema).concat(tareSchema);
