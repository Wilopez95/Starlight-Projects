import { isBefore, isValid, parse } from 'date-fns';
import { TFunction } from 'i18next';
import * as Yup from 'yup';

export const requireValidTimeIfDayEnabled = (t: TFunction, i18nBaseString: string) =>
  Yup.string().when(`active`, {
    is: true,
    then: Yup.string()
      .required(t(`${i18nBaseString}TimeRequired`))
      .test(`startTime`, t(`${i18nBaseString}TimeInvalid`), value => {
        if (!value) {
          return false;
        }

        const time = parse(value, 'HH:mm:ss', new Date());

        return isValid(time);
      }),
    otherwise: Yup.string().nullable(),
  });

export const requireValidTimeAfterStartIfDayEnabled = (t: TFunction, i18nBaseString: string) =>
  Yup.string().when(`active`, {
    is: true,
    then: Yup.string()
      .test('endTime', t(`${i18nBaseString}TimeAfter`), function (value) {
        const startTime = parse(this.parent.startTime as string, 'HH:mm:ss', new Date());

        if (!isValid(startTime)) {
          return true;
        }

        if (!value) {
          return false;
        }

        const timeValue = parse(value, 'HH:mm:ss', new Date());

        return isBefore(startTime, new Date(timeValue));
      })
      .test('endTime', t(`${i18nBaseString}StartTimeRequired`), function (value) {
        const dayEnabled = this.parent.active;
        const startTime = this.parent.startTime;

        if (!dayEnabled) {
          return true;
        }

        return !(value && !startTime);
      })
      .test('startTime', t(`${i18nBaseString}TimeInvalid`), value => {
        if (!value) {
          return false;
        }

        const time = parse(value, 'HH:mm:ss', new Date());

        return isValid(time);
      })
      .required(t(`${i18nBaseString}TimeRequired`)),
    otherwise: Yup.string().nullable(),
  });
