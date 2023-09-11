import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { IValidatePhoneNumber } from '@root/i18n/types';
import { Driver } from '@root/stores/driver/Driver';
import { IDriverFormikData } from '@root/types/entities/driver';

export const generateValidationSchema = (
  t: TFunction,
  i18n: string,
  validatePhoneNumber: IValidatePhoneNumber,
) => {
  return Yup.object().shape({
    active: Yup.boolean(),
    description: Yup.string().required(t(`${i18n}DescriptionIsRequired`)),
    email: Yup.string().required(t(`${i18n}EmailIsRequired`)),
    businessUnitIds: Yup.array().required(t(`${i18n}BusinessUnitRequired`)),
    licenseValidityDate: Yup.date()
      .nullable(true)
      .required(t(`${i18n}LicenseValidityDateRequired`)),
    licenseNumber: Yup.string().required(t(`${i18n}LicenseNumberIsRequired`)),
    truckId: Yup.number().required(t(`${i18n}DefaultTruckIsRequired`)),
    phone: Yup.string()
      .ensure()
      .test(
        'mobile',
        t(`${i18n}ValidPhone`),
        value => (!!value && validatePhoneNumber(value)) || value === '',
      ),
    licenseType: Yup.string()
      .required(t(`${i18n}LicenseTypeIsRequired`))
      .max(30, t(`${i18n}TooMuchCharacters`)),
  });
};

export const defaultValue: IDriverFormikData = {
  id: 0,
  active: true,
  description: '',
  businessUnitIds: [],
  photoUrl: '',
  image: null,
  phone: '',
  email: '',
  truckId: undefined,
  licenseNumber: '',
  licenseType: '',
  licenseValidityDate: undefined,
  medicalCardValidityDate: undefined,
  workingWeekdays: [],
};

export const getValues = (driver: Driver | null, isNew: boolean) => {
  if (!driver || isNew) {
    return {
      ...defaultValue,
    };
  }

  return {
    ...driver,
  };
};
