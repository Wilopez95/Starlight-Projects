import * as yup from 'yup';
import { DECIMAL_PRECISION } from '../../../../constants/regex';
import { dumpOrderBaseSchema } from '../dumpOrderBaseSchema';
import i18n from '../../../../i18n';
import { tareSchema } from '../../schemas/tareSchema';
import { OrderType } from '../../../../graphql/api';

export const weightOutOrderSchemaShape = yup
  .object()
  .shape({
    departureAt: yup.date().when('arrivedAt', (arrivedAt: any) => {
      if (!arrivedAt) {
        return yup.date().typeError(i18n.t('Invalid date')).required(i18n.t('Required'));
      }

      if (arrivedAt instanceof Date && arrivedAt.toString() === 'Invalid Date') {
        return yup.date().typeError(i18n.t('Invalid date')).required(i18n.t('Required'));
      }

      return yup
        .date()
        .typeError(i18n.t('Invalid date'))
        .required(i18n.t('Required'))
        .min(new Date(arrivedAt), i18n.t('DepartureAtArrival'));
    }),
    weightOut: yup
      .number()
      .nullable()
      .optional()
      .when(
        ['bypassScale', 'useTare', 'type'],
        (bypassScale: boolean, useTare: boolean, type: OrderType, schema: yup.NumberSchema) => {
          if (bypassScale || (type === OrderType.Dump && useTare)) {
            return schema;
          }

          return schema
            .max(10000000000, i18n.t('MaxValue', { max: 10000000000 }))
            .test('is-decimal', i18n.t('Max 2 numbers after decimal'), (value) =>
              value ? DECIMAL_PRECISION.test(`${value}`) : true,
            )
            .positive(i18n.t('NumberPositive'))
            .typeError(i18n.t('NumberPositive'));
        },
      ),
    netWeight: yup.number().positive(i18n.t('NumberPositive')).typeError(i18n.t('NumberPositive')),
  })
  .concat(tareSchema);

export const schema = dumpOrderBaseSchema.concat(weightOutOrderSchemaShape);
