import * as Yup from 'yup';

import { GeometryType } from '@root/consts';
import { DEFAULT_ADDRESS, US_CENTROID } from '@root/consts/address';
import { IntlConfig } from '@root/i18n/types';

import { IJobSiteEditData } from './types';

export const generateValidationSchema = (intl: IntlConfig) =>
  Yup.object().shape({
    geofence: Yup.object()
      .nullable()
      .shape({
        radius: Yup.number().when('type', {
          is: type => type === GeometryType.radius,
          then: Yup.number().typeError('Must be a number').positive('Must be positive'),
        }),
      }),
    name: Yup.string(),
    address: Yup.object().shape({
      addressLine1: Yup.string()
        .required('Address Line 1 is required')
        .max(100, 'Please enter up to 100 characters'),
      addressLine2: Yup.string().nullable().max(100, 'Please enter up to 100 characters'),
      city: Yup.string().required('City is required').max(50, 'Please enter up to 50 characters'),
      state: Yup.string().required('State is required').max(50, 'Please enter up to 50 characters'),
      zip: Yup.string()
        .matches(intl.zipRegexp, 'ZIP must be in correct format')
        .required('ZIP is required'),
    }),
  });

export const defaultValue: IJobSiteEditData = {
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  name: undefined,
  address: DEFAULT_ADDRESS,
  location: US_CENTROID,
  cabOver: false,
  alleyPlacement: false,
  recyclingDefault: false,
  showGeofencing: false,
  geofence: null,
};
