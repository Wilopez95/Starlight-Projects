import { TFunction } from 'i18next';
import { differenceWith } from 'lodash-es';
import * as Yup from 'yup';

import { IMaterialCodePayload, IMaterialCodeResponse } from '@root/api/disposalSite/types';
import { IMaterial } from '@root/types';

export interface IMaterialCodeFormData {
  materialCodes: IMaterialCodePayload[];
}

export const generateValidationSchema = (t: TFunction, i18n: string) => {
  return Yup.object().shape({
    materialCodes: Yup.array().of(
      Yup.object().shape({
        materialId: Yup.number().required(t(`${i18n}MaterialRequired`)),
      }),
    ),
  });
};

const defaultValue: IMaterialCodeFormData = {
  materialCodes: [],
};

export const getValues = ({
  materials,
  businessLineId,
  items,
}: {
  materials: IMaterial[];
  businessLineId: number;
  items: IMaterialCodeResponse[];
}): IMaterialCodeFormData => {
  if (!items) {
    return defaultValue;
  }

  const materialBasedCodes: IMaterialCodePayload[] = materials.map(material => ({
    businessLineId: businessLineId.toString(),
    materialId: material.id.toString(),
    recyclingMaterialCode: null,
    recyclingMaterialDescription: '',
    recyclingMaterialId: '0',
    billableLineItemId: null,
  }));

  const diff = differenceWith(
    materialBasedCodes,
    items,
    (item1, item2) => item1.materialId.toString() === item2.materialId.toString(),
  );

  return {
    materialCodes: [...items, ...diff],
  };
};
