import { differenceInDays, format } from 'date-fns';
import i18next from 'i18next';
import { isDate } from 'lodash-es';
import * as Yup from 'yup';

import { isTimeAfter } from '@root/components/OrderTimePicker/helpers';
import { BestTimeToCome } from '@root/components/OrderTimePicker/types';
import { notNullObject } from '@root/helpers';
import { dateFormatsEnUS } from '@root/i18n/format/date';
import { IOrder, Maybe } from '@root/types';

import { IRescheduleOrderData } from './types';

const commentLength = 120;
const I18N_PATH = 'components.forms.RescheduleOrder.Text.';

export const getValidationSchema = (deferredUntil?: Date) =>
  Yup.object().shape({
    comment: Yup.string()
      .nullable()
      .trim()
      .max(120, i18next.t(`${I18N_PATH}PleaseEnterComment`, { commentLength })),
    bestTimeToCome: Yup.string(),
    oldServiceDate: Yup.date(),
    bestTimeToComeFrom: Yup.mixed()
      .nullable()
      .when('bestTimeToCome', {
        is: (bestTimeToCome: BestTimeToCome) => bestTimeToCome !== 'any',
        then: Yup.mixed().required(i18next.t(`ValidationErrors.TimeIsRequired`)),
      }),
    bestTimeToComeTo: Yup.mixed().when('bestTimeToCome', {
      is: (bestTimeToCome: BestTimeToCome) => bestTimeToCome !== 'any',
      then: Yup.mixed()
        .required(i18next.t(`ValidationErrors.TimeIsRequired`))
        .test(
          'bestTimeToComeTo',
          i18next.t(`ValidationErrors.MustBeGreaterThanFromTime`),
          function (date: Maybe<unknown>) {
            const timeFrom: string = isDate(this.parent.bestTimeToComeFrom)
              ? format(this.parent.bestTimeToComeFrom as Date, dateFormatsEnUS.time24)
              : this.parent.bestTimeToComeFrom;
            const timeTo = isDate(date) ? format(date, dateFormatsEnUS.time24) : (date as string);

            return isTimeAfter(timeFrom, timeTo);
          },
        ),
    }),
    serviceDate: Yup.date()

      .test(
        'serviceDate',
        i18next.t(`${I18N_PATH}NewDateCannotBeLessThanTheCurrentDate`),
        (date?: Maybe<Date>) => {
          const currentDate = new Date();

          return !!date && differenceInDays(date, currentDate) >= 0;
        },
      )
      .test(
        'serviceDate',
        i18next.t(`${I18N_PATH}ServiceDateMustBeAfterDeferredPaymentDate`),
        (date?: Maybe<Date>) => {
          return !date || !deferredUntil || differenceInDays(date, deferredUntil) >= 1;
        },
      ),
  });

const defaultValue: IRescheduleOrderData = {
  oldServiceDate: new Date(),
  serviceDate: new Date(),
  addTripCharge: false,
  comment: '',
  bestTimeToCome: 'any',
  bestTimeToComeFrom: null,
  bestTimeToComeTo: null,
};

export const getValues = (order: IOrder): IRescheduleOrderData => {
  const item: Partial<IRescheduleOrderData> = {
    oldServiceDate: order.serviceDate,
    serviceDate: order.serviceDate,
    bestTimeToComeFrom: order.bestTimeToComeFrom,
    bestTimeToComeTo: order.bestTimeToComeTo,
    addTripCharge: false,
  };

  return notNullObject(item, defaultValue);
};
