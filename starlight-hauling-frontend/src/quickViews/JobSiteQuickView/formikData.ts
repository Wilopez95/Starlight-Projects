import * as Yup from 'yup';

import {
  defaultValue as jobSiteDefaultValue,
  generateValidationSchema as generateJobSiteSchema,
} from '@root/components/forms/JobSiteEdit/formikData';
import { IJobSiteEditData } from '@root/components/forms/JobSiteEdit/types';
import { GeometryType } from '@root/consts';
import { notNullObject } from '@root/helpers';
import { IntlConfig } from '@root/i18n/types';
import { type IJobSite } from '@root/types';

export interface IJobSiteSettings {
  jobSite: IJobSiteEditData;
  taxDistrictIds: number[];
}

export const generateValidationSchema = (intl: IntlConfig) =>
  Yup.object().shape({
    jobSite: generateJobSiteSchema(intl),
    taxDistrictIds: Yup.array().of(Yup.number().integer().positive()),
  });

export const defaultValues: IJobSiteSettings = {
  jobSite: jobSiteDefaultValue,
  taxDistrictIds: [],
};

export const getValues = (jobSite: IJobSite): IJobSiteSettings => {
  if (!jobSite) {
    return defaultValues;
  }

  const showGeofencing = !!jobSite.radius || !!jobSite.polygon;

  const jobSiteWithGeofence: IJobSiteEditData = {
    ...jobSite,
    geofence:
      jobSite.radius || jobSite.polygon
        ? {
            type: jobSite.radius ? GeometryType.radius : GeometryType.polygon,
            radius: jobSite.radius ?? undefined,
            coordinates: jobSite.polygon?.coordinates ?? undefined,
          }
        : null,
  };

  const values = {
    jobSite: { ...notNullObject(jobSiteWithGeofence, jobSiteDefaultValue), showGeofencing },
    taxDistrictIds: jobSite.taxDistricts?.map(({ id }) => id) ?? [],
  };

  return values;
};
