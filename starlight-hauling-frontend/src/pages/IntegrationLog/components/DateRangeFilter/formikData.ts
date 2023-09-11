import { endOfDay, isBefore, startOfDay, subDays } from 'date-fns';
import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { Maybe } from '@root/types';

const I18N_PATH =
  'pages.SystemConfiguration.tables.AuditLog.components.DateRangeFilter.ValidationErrors.';

export const getInitialValues = (fromKey: string, toKey: string) => {
  const currentDate = new Date();

  return {
    [fromKey]: subDays(startOfDay(currentDate), 29),
    [toKey]: endOfDay(currentDate),
  };
};

export const generateValidationSchema = (fromKey: string, toKey: string, t: TFunction) =>
  Yup.object().shape({
    [fromKey]: Yup.date()
      .typeError('')
      .required(t(`${I18N_PATH}Required`)),
    [toKey]: Yup.date()
      .typeError('')
      .required(t(`${I18N_PATH}Required`))
      .test('endDate', t(`${I18N_PATH}GreaterThanStartDate`), function (date?: Maybe<Date>) {
        if (!this.parent[fromKey]) {
          return true;
        }

        return !!date && !isBefore(date, this.parent[fromKey] as Date);
      }),
  });
