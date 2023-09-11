import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { emailValidator } from '@root/helpers';

export const validationSchema = (t: TFunction) =>
  Yup.object().shape({
    emails: Yup.array()
      .of(Yup.string().email(emailValidator))
      .min(1, t('ValidationErrors.EmailsAreRequired')),
  });
