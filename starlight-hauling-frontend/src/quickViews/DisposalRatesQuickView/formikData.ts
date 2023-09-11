import { TFunction } from 'i18next';
import { differenceWith } from 'lodash-es';
import * as Yup from 'yup';

import { IDisposalRatePayload, IDisposalRateResponse } from '@root/api/disposalSite/types';
import { priceValidator } from '@root/helpers';
import { IMaterial } from '@root/types';

export const generateValidationSchema = (t: TFunction, i18n: string) => {
  return Yup.object().shape({
    disposalRates: Yup.array().of(
      Yup.object().shape({
        materialId: Yup.number().required(t(`${i18n}MaterialRequired`)),
        rate: Yup.number()
          .typeError(t('ValidationErrors.MustBeNumber'))
          .min(0, t(`${i18n}RateMustBeGreaterThanZero`))
          .test('rate', t(`${i18n}DisposalRatesIncorrectFormat`), priceValidator)
          .nullable(),
      }),
    ),
  });
};

export interface IDisposalRateFormData {
  disposalRates: IDisposalRatePayload[];
}

const defaultValue: IDisposalRateFormData = {
  disposalRates: [],
};

export const getValues = ({
  materials,
  businessLineId,
  items,
}: {
  materials: IMaterial[];
  businessLineId: number;
  items: IDisposalRateResponse[];
}): IDisposalRateFormData => {
  if (!items) {
    return defaultValue;
  }

  const disposalRates: IDisposalRatePayload[] = materials.map(material => ({
    businessLineId: businessLineId.toString(),
    materialId: material.id.toString(),
    unit: 'ton',
    rate: null,
  }));

  const diff = differenceWith(
    disposalRates,
    items,
    (item1, item2) => item1.materialId.toString() === item2.materialId.toString(),
  );

  return {
    disposalRates: [...items, ...diff],
  };
};
