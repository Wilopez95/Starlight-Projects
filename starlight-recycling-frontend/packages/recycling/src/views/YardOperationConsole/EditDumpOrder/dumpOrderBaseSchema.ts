import { isNull } from 'lodash/fp';
import * as yup from 'yup';
import { DECIMAL_PRECISION } from '../../../constants/regex';
import i18n from '../../../i18n';
import { commonOrderBaseSchema } from '../commonOrderBaseSchema';
import { CustomerOption } from '../../../components/FinalForm/CustomerSearchField';
import { ObjectSchema } from 'yup';
import { serviceSchema } from '../schemas/serviceSchema';
import { CustomerTruckOption } from '../Inputs/CustomerTruckInput';
import { CustomerTruckTypes, CustomerType } from '../../../graphql/api';

const schema = yup.object().shape({
  weightIn: yup
    .number()
    .positive(i18n.t('NumberPositive'))
    .max(10000000000, i18n.t('MaxValue', { max: 10000000000 }))
    .test('is-decimal', i18n.t('Max 2 numbers after decimal'), (value) =>
      value ? DECIMAL_PRECISION.test(`${value}`) : true,
    )
    .typeError(i18n.t('NumberPositive')),
  material: yup
    .object()
    .nullable()
    .required(i18n.t('Required'))
    .when('customer', { is: (customer) => isNull(customer), then: yup.object().optional() }),
  containerId: yup
    .number()
    .nullable()
    .optional()
    .when('customerTruck', (customerTruck: CustomerTruckOption['customerTruck'], schema: any) => {
      if (customerTruck && customerTruck.type === CustomerTruckTypes.Rolloff) {
        return schema.required(i18n.t('Required'));
      }

      return schema;
    }),
  licensePlate: yup
    .string()
    .nullable()
    .optional()
    .when('customer', (customer: CustomerOption['customer'], schema: yup.StringSchema) => {
      if (customer?.type === CustomerType.Walkup) {
        return schema.required(i18n.t('Required'));
      }

      return schema;
    }),
  jobSite: yup
    .object()
    .nullable()
    .optional()
    .typeError(i18n.t('Required'))
    .when(
      ['customer', 'bypassScale'],
      (customer: CustomerOption['customer'], bypassScale: boolean, schema: ObjectSchema) => {
        if (customer?.jobSiteRequired && !bypassScale) {
          return schema.required(i18n.t('Required'));
        }

        return schema;
      },
    ),
  requireOrigin: yup.bool().nullable(),
  originDistrictId: yup
    .number()
    .nullable()
    .when('requireOrigin', {
      is: true,
      then: yup.number().required(i18n.t('Required')),
    }),
});

export const dumpOrderBaseSchema = commonOrderBaseSchema.concat(schema).concat(serviceSchema);
