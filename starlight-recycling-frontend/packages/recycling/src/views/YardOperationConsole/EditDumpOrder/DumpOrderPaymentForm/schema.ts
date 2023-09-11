import * as Yup from 'yup';
import { dumpOrderBaseSchema } from '../dumpOrderBaseSchema';
import { PaymentMethodType } from '../../../../graphql/api';
import { DECIMAL_PRECISION } from '../../../../constants/regex';
import i18n from '../../../../i18n';

export const paymentOrderSchemaShape = Yup.object().shape({
  priceGroupId: Yup.number().required(i18n.t('Required')),
  billableItems: Yup.array()
    .of(
      Yup.object().shape({
        materialId: Yup.number()
          .positive()
          .nullable()
          .when('pricingBasedOnMaterial', {
            is: true,
            then: Yup.number().required(i18n.t('Required')),
          }),
        quantity: Yup.number().transform(Number).positive(i18n.t('NumberPositive')).max(99999),
      }),
    )
    .min(1),
  paymentMethod: Yup.mixed<PaymentMethodType>()
    .oneOf(Object.values(PaymentMethodType))
    .required(i18n.t('Required')),
  checkNumber: Yup.string()
    .nullable()
    .when('paymentMethod', {
      is: PaymentMethodType.Check,
      then: Yup.string()
        .required(i18n.t('Required'))
        .max(100, i18n.t('MaxLength', { number: 100 })),
    }),
  amount: Yup.number().when('paymentMethod', {
    is: PaymentMethodType.Cash,
    then: Yup.number().when('grandTotal', (grandTotal: number) =>
      Yup.number()
        .required(i18n.t('Required'))
        .positive(i18n.t('NumberPositive'))
        .typeError(i18n.t('Required'))
        .lessThan(1e100, i18n.t('MaxLength', { number: 100 }))
        .test('is-decimal', i18n.t('Max 2 numbers after decimal'), (value) =>
          value ? DECIMAL_PRECISION.test(`${value}`) : true,
        )
        .min(grandTotal, i18n.t('GreaterOrEqualTotalPrice')),
    ),
    otherwise: Yup.number().nullable(),
  }),
  creditCardId: Yup.number()
    .nullable()
    .when('paymentMethod', {
      is: PaymentMethodType.CreditCard,
      then: Yup.number().required(i18n.t('Required')),
    }),
});

export const schema = dumpOrderBaseSchema.concat(paymentOrderSchemaShape);
