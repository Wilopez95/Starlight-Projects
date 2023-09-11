import * as Yup from 'yup';

import { notNullObject } from '@root/helpers';
import { ServiceAreaStore } from '@root/stores/serviceArea/ServiceAreaStore';
import { IServiceArea } from '@root/types';

export const descriptionMaxLength = 256;

export const generateValidationSchema = (
  serviceAreaStore: ServiceAreaStore,
  businessLineId: string,
) => {
  const currentServiceAreaName = serviceAreaStore.selectedEntity?.name;
  const serviceAreasNames = serviceAreaStore.values
    .filter(
      item =>
        item.name !== currentServiceAreaName && item.businessLineId.toString() === businessLineId,
    )
    .map(item => item.name.toLowerCase());

  return Yup.object().shape({
    name: Yup.string()
      .trim()
      .max(120, 'Name must not exceed 120 characters')
      .required('Name is required')
      .lowercase()
      .notOneOf(serviceAreasNames, 'Name must be unique'),
    description: Yup.string()
      .trim()
      .max(descriptionMaxLength, 'Description must not exceed 256 characters')
      .required('Description is required'),
  });
};

const getDefaultValues = (
  businessUnitId?: string,
  businessLineId?: string,
): Omit<IServiceArea, 'createdAt' | 'updatedAt'> => ({
  id: 0,
  active: true,
  name: '',
  description: '',
  businessUnitId: businessUnitId ?? '',
  businessLineId: businessLineId ?? '',
  geometry: {
    type: 'MultiPolygon',
    coordinates: [],
  },
});

export const getValues = (
  serviceArea: IServiceArea | null,
  businessUnitId?: string,
  businessLineId?: string,
): IServiceArea => {
  const defaultValues = getDefaultValues(businessUnitId, businessLineId);

  if (!serviceArea) {
    return defaultValues as IServiceArea;
  }

  return notNullObject(serviceArea, defaultValues) as IServiceArea;
};
