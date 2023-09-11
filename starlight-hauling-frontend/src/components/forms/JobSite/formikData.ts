import * as Yup from 'yup';

import { GeometryType } from '@root/consts';
import { DEFAULT_ADDRESS, US_CENTROID } from '@root/consts/address';
import { notNullObject } from '@root/helpers';
import { IntlConfig } from '@root/i18n/types';

import { Point } from 'geojson';
import { IAddress } from '@root/types';

import { MapboxGeocoderService } from '@root/api';
import { IJobSiteData } from './types';

export const generateValidationSchema = (intl: IntlConfig) =>
  Yup.object().shape({
    searchString: Yup.string(),
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
    alleyPlacement: Yup.boolean(),
    cabOver: Yup.boolean(),
    showGeofencing: Yup.boolean(),
    geofence: Yup.object()
      .nullable()
      .shape({
        radius: Yup.number().when('type', {
          is: type => type === GeometryType.radius,
          then: Yup.number().typeError('Must be a number').positive('Must be positive'),
        }),
      }),
  });

const defaultValue: IJobSiteData = {
  address: DEFAULT_ADDRESS,
  searchString: '',
  location: US_CENTROID,
  alleyPlacement: false,
  cabOver: false,
  showGeofencing: false,
  geofence: null,
};

export const getDefaultValues = (item?: IJobSiteData): IJobSiteData => {
  if (!item) {
    return defaultValue;
  }

  return notNullObject(item, defaultValue);
};

export const getBusinessUnitValues = async (
  address: IAddress,
  item?: IJobSiteData,
): Promise<IJobSiteData> => {
  if (!item) {
    const coords = await new MapboxGeocoderService().getPlace(address);

    if (coords !== null) {
      item = {
        address,
        searchString: '',
        location: { type: 'Point', coordinates: coords } as Point,
        alleyPlacement: false,
        cabOver: false,
        showGeofencing: false,
        geofence: null,
      } as IJobSiteData;

      return notNullObject(item, defaultValue);
    }
  }
  return defaultValue;
};
