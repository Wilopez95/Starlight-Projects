import * as yup from 'yup';
import { CustomerOption } from '../../../components/FinalForm/CustomerSearchField';
import { CustomerType } from '../../../graphql/api';
import i18n from '../../../i18n';
import { DECIMAL_PRECISION } from '../../../constants/regex';

export const tareSchema = yup.object().shape({
  truckTare: yup
    .number()
    .nullable()
    .optional()
    .when(
      ['customer', 'useTare'],
      (customer: CustomerOption['customer'], useTare: boolean, schema: yup.NumberSchema) => {
        if (customer?.type === CustomerType.Walkup || !useTare) {
          return schema;
        }

        return schema
          .test('is-decimal', i18n.t('Max 2 numbers after decimal'), (value) =>
            value ? DECIMAL_PRECISION.test(`${value}`) : true,
          )
          .positive(i18n.t('NumberPositive'))
          .required(i18n.t('Required'))
          .typeError(i18n.t('NumberPositive'));
      },
    ),
  canTare: yup
    .number()
    .nullable()
    .optional()
    .when(
      ['customer', 'useTare', 'containerId'],
      (
        customer: CustomerOption['customer'],
        useTare: boolean,
        containerId: number,
        schema: yup.NumberSchema,
      ) => {
        if (customer?.type === CustomerType.Walkup || !useTare) {
          return schema;
        }

        if (containerId) {
          const decimal = schema.test(
            'is-decimal',
            i18n.t('Max 2 numbers after decimal'),
            (value) => (value ? DECIMAL_PRECISION.test(`${value}`) : true),
          );

          if (customer?.canTareWeightRequired) {
            return decimal
              .positive(i18n.t('NumberPositive'))
              .required(i18n.t('Required'))
              .typeError(i18n.t('NumberPositive'));
          }

          return decimal
            .nullable()
            .optional()
            .transform((v) => (isNaN(v) ? 0 : v));
        }

        return schema;
      },
    ),
});
