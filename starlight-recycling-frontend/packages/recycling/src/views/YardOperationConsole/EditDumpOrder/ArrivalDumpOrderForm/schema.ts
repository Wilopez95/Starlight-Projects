import * as yup from 'yup';
import { dumpOrderBaseSchema } from '../dumpOrderBaseSchema';
import i18n from '../../../../i18n';

export const arrivalOrderSchemaShape = yup.object().shape({
  miscellaneousMaterialsDistribution: yup.array().of(
    yup.object({
      id: yup.number().positive(),
      description: yup.string(),
      quantity: yup
        .number()
        .transform(Number)
        .min(0, i18n.t('MinValue', { min: 0 })),
    }),
  ),
  materialsDistribution: yup
    .array()
    .of(
      yup.object({
        id: yup.number().positive(),
        description: yup.string(),
        value: yup
          .number()
          .min(0, i18n.t('MinValue', { min: 0 }))
          .max(100, i18n.t('MaxValue', { max: 100 })),
      }),
    )
    .when('customer', {
      is: (customer) => !customer.gradingRequired,
      then: yup.array().nullable(),
    }),
  materialsDistributionTotal: yup
    .number()
    .max(100, i18n.t('MaxValue', { max: 100 }))
    .when('customer', {
      is: (customer) => customer.gradingRequired,
      then: yup
        .number()
        .test('exact100', i18n.t('Equality', { number: 100 }), (total) => total === 100),
    }),
  arrivedAt: yup.date().typeError(i18n.t('Invalid date')).required(i18n.t('Required')),
});

export const schema = dumpOrderBaseSchema.concat(arrivalOrderSchemaShape);
