import { TFunction } from 'i18next';
import * as Yup from 'yup';

export const generateValidationSchema = (t: TFunction, i18n: string) =>
  Yup.object()
    .shape({
      reason: Yup.string().required(t(`${i18n}ReasonRequired`)),
      reasonDescription: Yup.string().nullable(),
      holdSubscriptionUntil: Yup.date().nullable(),
    })
    .required();

export const initialValues = (reason: string) => ({
  reason,
  reasonDescription: null,
  holdSubscriptionUntil: null,
});
