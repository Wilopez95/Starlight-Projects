import { endOfToday, isAfter } from 'date-fns';
import * as Yup from 'yup';

import { notNullObject } from '@root/helpers';
import { IPermit } from '@root/types/entities/permit';

export const getValidationSchema = (isNew: boolean) => {
  return Yup.object().shape({
    number: Yup.string().trim().required('Number is required'),
    expirationDate: Yup.mixed()
      .required('Expiration date is required')
      .test('is-after-today', 'Expiration date must be after today', (date: unknown) => {
        if (!isNew) {
          return true;
        }

        return date instanceof Date && isAfter(date, endOfToday());
      }),
    active: Yup.boolean().required(),
    jobSiteId: Yup.string(),
  });
};

// TODO fix this in a cleaner way
type PermitWithoutDate = Omit<IPermit, 'expirationDate'>;

const defaultValue = {
  id: 0,
  businessUnitId: '',
  businessLineId: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  number: '',
  active: true,
  jobSiteId: 0,
  expirationDate: undefined,
} as PermitWithoutDate;

export const getValues = (
  defaultOverrides: Partial<IPermit>,
  item: IPermit | null,
): PermitWithoutDate | IPermit => {
  if (!item) {
    return { ...defaultValue, ...defaultOverrides };
  }

  return notNullObject<IPermit>(item, defaultValue as IPermit);
};
