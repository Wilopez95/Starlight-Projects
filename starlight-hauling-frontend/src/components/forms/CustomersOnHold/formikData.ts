import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { useReasonOptions } from '../SubscriptionOnHold/hooks';

export const generateValidationSchema = (t: TFunction, i18n: string) =>
  Yup.object()
    .shape({
      reason: Yup.string().required(t(`${i18n}ReasonRequired`)),
      reasonDescription: Yup.string().nullable(),
      holdSubscriptionUntil: Yup.date().nullable(),
    })
    .required();

export const useGetInitialValues = () => {
  const reasonOptions = useReasonOptions();

  return {
    reason: reasonOptions[0].value.toString(),
    reasonDescription: null,
    holdSubscriptionUntil: null,
  };
};
