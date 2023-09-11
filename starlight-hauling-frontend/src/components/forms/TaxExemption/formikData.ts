import * as Yup from 'yup';

import { type FormikTaxExemption } from './types';

export const baseTaxExemptionShape = {
  enabled: Yup.boolean(),
  authNumber: Yup.string().when('enabled', {
    is: true,
    then: Yup.string().nullable().trim().required('Auth# is required'),
    otherwise: Yup.string().nullable().trim(),
  }),
  imageUrl: Yup.string().nullable(),
  image: Yup.mixed()
    .test('isFile', 'Image must be a valid file', value => !value || value instanceof File)
    .nullable(),
};

export const taxExemptionValidationSchema = Yup.object().shape({
  ...baseTaxExemptionShape,
  nonGroup: Yup.array().of(Yup.object().shape(baseTaxExemptionShape)),
});

export const defaultValue: FormikTaxExemption = {
  enabled: false,
  authNumber: '',
  imageUrl: null,
  image: null,
  nonGroup: [],
  author: null,
  timestamp: null,
};

export const getTaxExemptionFormValue = (
  taxDistrictIds: number[],
  value?: FormikTaxExemption,
): FormikTaxExemption => {
  const result = value ?? { ...defaultValue, nonGroup: [...defaultValue.nonGroup!] };

  if (!result.nonGroup) {
    result.nonGroup = [];
  }

  const hasDistrictId = (districtId: number) =>
    result.nonGroup?.find(({ taxDistrictId }) => taxDistrictId === districtId);

  return {
    ...result,
    nonGroup: result.nonGroup.concat(
      taxDistrictIds
        .filter(districtId => !hasDistrictId(districtId))
        .map(districtId => ({
          taxDistrictId: districtId,
          enabled: false,
          imageUrl: null,
          image: null,
        })),
    ),
  };
};

export const sanitizeTaxExemptionValue = (value: FormikTaxExemption) => {
  if (value.image) {
    value.groupFile = value.image;
    value.image = undefined;
  }

  if (!value.authNumber) {
    value.authNumber = null;
  }

  value.nonGroup?.forEach(item => {
    if (item.image) {
      item[item.taxDistrictId] = item.image;
      item.image = undefined;
    }

    if (!item.authNumber) {
      item.authNumber = null;
    }
  });

  return value;
};
