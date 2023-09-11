import { isAfter } from 'date-fns';
import * as Yup from 'yup';

import { notNullObject } from '@root/helpers';
import { PromoStore } from '@root/stores/promo/PromoStore';
import { IPromo, Maybe } from '@root/types';

export const getValidationSchema = (promoStore: PromoStore, isNew: boolean) => {
  const currentId = promoStore.selectedEntity?.id;
  let promos = promoStore.values;

  if (currentId) {
    promos = promos.filter(promo => promo.id !== currentId);
  }

  const codes = promos.map(promo => promo.code.toLowerCase());

  return Yup.object().shape({
    active: Yup.boolean().required(),
    description: Yup.string()
      .nullable()
      .lowercase()
      .trim()
      .max(120, 'Please enter up to 120 characters'),
    code: Yup.string()
      .lowercase()
      .trim()
      .max(120, 'Please enter up to 120 characters')
      .required('Code is required')
      .notOneOf(codes, 'Code must be unique'),
    startDate: Yup.date().nullable(),
    endDate: Yup.date()
      .nullable()
      .test('endDate', 'End date must be greater than today', endDate => {
        const today = new Date();

        if (!isNew) {
          return true;
        }

        if (endDate) {
          return today < endDate;
        }

        return true;
      })
      .test(
        'endDate',
        'End date cannot be less than the start date',
        function (date?: Maybe<Date>) {
          return this.parent.startDate && date
            ? isAfter(date, this.parent.startDate as number | Date)
            : true;
        },
      ),
    note: Yup.string().nullable().max(120, 'Please enter up to 120 characters'),
  });
};

const defaultValue: IPromo = {
  id: 0,
  businessUnitId: '',
  businessLineId: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  active: true,
  description: null,
  code: '',
  startDate: null,
  endDate: null,
  note: null,
};

export const getValues = (defaultOverrides: Partial<IPromo>, item?: IPromo | null) => {
  if (!item) {
    return { ...defaultValue, ...defaultOverrides };
  }

  return notNullObject(item, defaultValue);
};
