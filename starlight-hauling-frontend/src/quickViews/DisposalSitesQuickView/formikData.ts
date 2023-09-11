import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { DEFAULT_ADDRESS, US_CENTROID } from '@root/consts/address';
import { waypointTypeOptions } from '@root/consts/disposalSite';
import { notNullObject } from '@root/helpers';
import { IntlConfig } from '@root/i18n/types';
import { DisposalSiteStore } from '@root/stores/disposalSite/DisposalSiteStore';
import { IDisposalSite } from '@root/types';

export const generateValidationSchema = (
  disposalSiteStore: DisposalSiteStore,
  t: TFunction,
  i18n: string,
  intl: IntlConfig,
) => {
  const currentId = disposalSiteStore.selectedEntity?.id;
  let disposalSites = disposalSiteStore.values;

  if (currentId) {
    disposalSites = disposalSites.filter(disposalSite => disposalSite.id !== currentId);
  }

  const descriptions = disposalSites.map(disposalSite => disposalSite.description);

  return Yup.object().shape({
    active: Yup.boolean().required(),
    description: Yup.string()
      .trim()
      .required(t(`${i18n}DescriptionRequired`))
      .notOneOf(descriptions, t(`${i18n}DescriptionMustBeUnique`)),
    waypointType: Yup.string()
      .oneOf(waypointTypeOptions)
      .required(t(`${i18n}WaypointTypeRequired`)),
    address: Yup.object().shape({
      addressLine1: Yup.string()
        .required(t(`${i18n}AddressLineRequired`))
        .max(100, t(`${i18n}PleaseEnterUpTo`, { chars: 100 })),
      addressLine2: Yup.string()
        .nullable()
        .max(100, t(`${i18n}PleaseEnterUpTo`, { chars: 100 })),
      city: Yup.string()
        .required(t(`${i18n}CityRequired`))
        .max(50, t(`${i18n}PleaseEnterUpTo`, { chars: 50 })),
      state: Yup.string()
        .required(t(`${i18n}StateRequired`))
        .max(50, t(`${i18n}PleaseEnterUpTo`, { chars: 50 })),
      zip: Yup.string()
        .matches(intl.zipRegexp, 'ZIP must be in correct format')
        .required(t(`${i18n}ZipRequired`)),
    }),
  });
};

export interface IDisposalSiteFormData extends IDisposalSite {
  searchString: string;
}

const defaultValue: IDisposalSiteFormData = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  searchString: '',
  active: true,
  description: '',
  waypointType: 'recycle',
  recycling: false,
  location: US_CENTROID,
  address: DEFAULT_ADDRESS,
  hasStorage: true,
  hasWeighScale: true,
  businessUnitId: 0,
  recyclingTenantName: '',
};

export const getValues = (
  item: IDisposalSite | null,
  searchString: string,
): IDisposalSiteFormData => {
  if (!item) {
    return defaultValue;
  }

  return notNullObject({ ...item, searchString }, defaultValue);
};
