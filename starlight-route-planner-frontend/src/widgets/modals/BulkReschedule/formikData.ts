import { TFunction } from 'i18next';
import { date, object } from 'yup';

import { Maybe } from '@root/types';

const I18N_PATH = 'components.modals.BulkReschedule.Validation.';

export const validationSchema = (validateServiceDate: (value?: string) => boolean, t: TFunction) =>
  object({
    serviceDate: date()
      .required(t(`${I18N_PATH}ServiceDateRequired`))
      .test('serviceDate', t(`${I18N_PATH}DateMustDiffer`), (value?: Maybe<Date>) =>
        validateServiceDate(String(value)),
      ),
  });
