import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { taxDistrictTypes } from '@root/consts';
import { notNullObject } from '@root/helpers';
import { type TaxDistrictStore } from '@root/stores/taxDistrict/TaxDistrictStore';
import { ITaxDistrict, TaxDistrictType, TaxGroup } from '@root/types';

export const generateValidationSchema = (
  taxDistrictStore: TaxDistrictStore,
  t: TFunction,
  i18n: string,
) => {
  const currentId = taxDistrictStore.selectedEntity?.id;
  let districts = taxDistrictStore.values;

  if (currentId) {
    districts = districts.filter(district => district.id !== currentId);
  }

  const descriptions = districts.map(district => district.description);
  const codes = districts.map(district => district.districtCode);

  return Yup.object().shape({
    active: Yup.boolean(),
    isSales: Yup.boolean(),
    description: Yup.string()
      .trim()
      .required(t(`${i18n}DescriptionRequired`))
      .notOneOf(descriptions, t(`${i18n}DescriptionUnique`)),
    districtType: Yup.string()
      .oneOf(taxDistrictTypes, t(`${i18n}WrongDistrictType`))
      .required(t(`${i18n}DistrictTypeRequired`)),
    districtCode: Yup.string()
      .trim()
      .test('districtCode', t(`${i18n}DistrictMustBeUnique`), val =>
        !val ? true : !codes.includes(val),
      ),
  });
};

export type TaxDistrictForm = Omit<ITaxDistrict, 'districtCode' | TaxGroup> & {
  districtCode?: string;
};

const defaultValue: TaxDistrictForm = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  active: true,
  description: '',
  districtType: TaxDistrictType.Primary,
  districtCode: undefined,
  districtName: '',
  bbox: undefined,
  taxDescription: undefined,
  useGeneratedDescription: true,
  includeNationalInTaxableAmount: false,
  taxesPerCustomerType: false,
  businessLineTaxesIds: [],
  businessConfiguration: [],
};

export const getValues = (item?: ITaxDistrict | null): TaxDistrictForm => {
  if (!item) {
    return defaultValue;
  }

  const formValues = notNullObject(item, defaultValue);

  return formValues;
};
