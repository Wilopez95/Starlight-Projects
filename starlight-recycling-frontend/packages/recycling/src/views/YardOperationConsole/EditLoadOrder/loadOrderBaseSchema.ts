import * as Yup from 'yup';
import { commonOrderBaseSchema } from '../commonOrderBaseSchema';
import i18n from '../../../i18n';
import { DECIMAL_PRECISION } from '../../../constants/regex';
import { serviceSchema } from '../schemas/serviceSchema';
import * as yup from 'yup';
import { CustomerTruckOption } from '../Inputs/CustomerTruckInput';
import { CustomerTruckTypes, CustomerType } from '../../../graphql/api';
import { CustomerOption } from '../../../components/FinalForm/CustomerSearchField';

export const loadOrderBaseSchema = commonOrderBaseSchema
  .concat(
    Yup.object().shape({
      weightIn: Yup.number()
        .nullable()
        .optional()
        .when(
          ['useTare', 'bypassScale'],
          (useTare: boolean, bypassScale: boolean, schema: Yup.NumberSchema) => {
            if (useTare || bypassScale) {
              return schema;
            }

            return schema
              .positive(i18n.t('NumberPositive'))
              .max(10000000000, i18n.t('MaxValue', { max: 10000000000 }))
              .test('is-decimal', i18n.t('Max 2 numbers after decimal'), (value) =>
                value ? DECIMAL_PRECISION.test(`${value}`) : true,
              )
              .typeError(i18n.t('NumberPositive'));
          },
        ),
      containerId: yup
        .number()
        .nullable()
        .optional()
        .when(
          'customerTruck',
          (customerTruck: CustomerTruckOption['customerTruck'], schema: any) => {
            if (customerTruck && customerTruck.type === CustomerTruckTypes.Rolloff) {
              return schema.required(i18n.t('Required'));
            }

            return schema;
          },
        ),
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
    }),
  )
  .concat(serviceSchema);
