import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { type LogoInformationRequest } from '@root/api';
import { notNullObject } from '@root/helpers';
import { PartialOrNull, type ICompany } from '@root/types';

export const validationSchema = (t: TFunction, i18nPath: string) =>
  Yup.object().shape({
    companyNameLine1: Yup.string()
      .strict(true)
      .trim('Leading and trailing whitespace not allowed')
      .max(120, t(`ValidationErrors.MaxLength`, { number: 120 }))
      .required(t(`${i18nPath}CompanyNameLine`)),
    companyNameLine2: Yup.string()
      .strict(true)
      .trim('Leading and trailing whitespace not allowed')
      .max(120, t(`ValidationErrors.MaxLength`, { number: 120 }))
      .nullable(),
    imageUrl: Yup.string().notRequired().nullable(),
    image: Yup.mixed()
      .notRequired()
      .test('isFile', t(`${i18nPath}ImageMustBeValid`), value => !value || value instanceof File)
      .nullable(),
  });

const defaultValue: LogoInformationRequest = {
  companyNameLine1: '',
  companyNameLine2: undefined,
  logoUrl: null,
  logo: null,
  updatedAt: new Date(),
  id: 0,
};

export const getFormValues = (item?: ICompany | null): PartialOrNull<LogoInformationRequest> => {
  if (!item) {
    return defaultValue;
  }

  return notNullObject(item, defaultValue);
};
