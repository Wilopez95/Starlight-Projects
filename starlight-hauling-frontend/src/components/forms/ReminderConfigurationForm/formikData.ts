import { TFunction } from 'i18next';
import * as Yup from 'yup';

export const generateValidationSchema = (isConfigVisible: boolean, t: TFunction, i18n: string) => {
  if (isConfigVisible) {
    return Yup.object().shape({
      date: Yup.date()
        .nullable()
        .required(t(`${i18n}ReminderDateIsRequired`)),
      informBy: Yup.object()
        .shape({
          informByApp: Yup.boolean(),
          informByEmail: Yup.boolean(),
          informBySms: Yup.boolean(),
        })
        .test('atLeastOne', t(`${i18n}PleaseSelectReminder`), obj => {
          if (obj?.informByApp || obj?.informByEmail || obj?.informBySms) {
            return true;
          }

          return false;
        }),
    });
  }

  return null;
};
