import * as yup from 'yup';
import { loadOrderBaseSchema } from '../loadOrderBaseSchema';
import i18n from '../../../../i18n';
import { tareSchema } from '../../schemas/tareSchema';

export const arrivalLoadOrderSchema = yup
  .object()
  .shape({
    arrivedAt: yup.date().typeError(i18n.t('Invalid date')).required(i18n.t('Required')),
  })
  .concat(tareSchema);

export const schema = loadOrderBaseSchema.concat(arrivalLoadOrderSchema);
