import * as yup from 'yup';
import moment from 'moment';
import validator from 'validator';
import { CVV_REGEX } from '../../../constants/regex';
import i18n from '../../../i18n';

export const CreditCardSchema = yup.object().shape({
  active: yup.bool().required(i18n.t('Required')),
  cardNickname: yup
    .string()
    .max(100, i18n.t('MaxLength', { number: 100 }))
    .nullable(),
  nameOnCard: yup
    .string()
    .max(50, i18n.t('MaxLength', { number: 50 }))
    .required(i18n.t('Required')),
  cardNumber: yup
    .string()
    .transform((v) => v && v.replace(/ /g, '').trim())
    .test(
      'is-card-number',
      i18n.t('Please enter a valid card number'),
      (v) => !!v && validator.isCreditCard(v),
    ),
  expireMonth: yup
    .string()
    .oneOf(moment.months())
    .required(i18n.t('Required'))
    .test('is-date-valid', i18n.t('Invalid Expiration Date'), function (expireMonth: string) {
      const year = Number(this.parent.expireYear);
      const month = moment.months().indexOf(expireMonth);

      if (!year || month === 11) {
        return true;
      }

      return moment({
        month: month + 1,
        year,
      }).isAfter(moment());
    }),
  expireYear: yup.string().required(i18n.t('Required')),
  cvv: yup
    .string()
    .min(3, i18n.t('MinValue', { min: 3 }))
    .max(5, i18n.t('MaxLength', { number: 5 }))
    .matches(CVV_REGEX, i18n.t('Invalid'))
    .when('id', {
      is: (id) => !!id,
      then: yup.string().nullable(),
      otherwise: yup.string().required(i18n.t('Required')),
    }),

  addressLine1: yup
    .string()
    .max(100, i18n.t('MaxLength', { number: 100 }))
    .required(i18n.t('Required')),
  addressLine2: yup
    .string()
    .max(100, i18n.t('MaxLength', { number: 100 }))
    .nullable(),
  state: yup
    .string()
    .max(100, i18n.t('MaxLength', { number: 100 }))
    .required(i18n.t('Required')),
  city: yup
    .string()
    .max(100, i18n.t('MaxLength', { number: 100 }))
    .required(i18n.t('Required')),
  zip: yup
    .string()
    .max(20, i18n.t('MaxLength', { number: 20 }))
    .required(i18n.t('Required')),
});
