import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { Truck } from '@root/stores/truck/Truck';
import { TruckStore } from '@root/stores/truck/TruckStore';
import { ITrucksFormikData } from '@root/types';

export const generateValidationSchema = (truckStore: TruckStore, t: TFunction, i18n: string) => {
  const currentId = truckStore.selectedEntity?.id;
  let trucks = truckStore.values;

  if (currentId) {
    trucks = trucks.filter(truck => truck.id !== currentId);
  }
  const licensePlates = trucks.filter(elem => elem.active).map(elem => elem.licensePlate);

  return Yup.object().shape({
    active: Yup.boolean(),
    description: Yup.string().required(t(`${i18n}DescriptionIsRequired`)),
    businessUnitIds: Yup.array().required(t(`${i18n}BusinessUnitRequired`)),
    truckTypeId: Yup.number().required(t(`${i18n}TruckTypeIsRequired`)),
    licensePlate: Yup.string()
      .strict(true)
      .trim('Leading and trailing whitespace not allowed')
      .required(t(`${i18n}LicensePlateIsRequired`))
      .notOneOf(licensePlates, t(`${i18n}LicenseUnique`)),
  });
};

export const defaultValue: Omit<ITrucksFormikData, 'createdAt' | 'updatedAt'> = {
  id: 0,
  active: true,
  description: '',
  businessUnitIds: [],
  licensePlate: '',
  note: '',
  truckTypeId: undefined,
};

export const getValues = (truck: Truck | null, isNew: boolean) => {
  const createNewTruck = !truck || isNew;

  return {
    id: !createNewTruck && truck ? truck.id : 0,
    active: !createNewTruck && truck ? truck.active : true,
    description: !createNewTruck && truck ? truck.description : '',
    businessUnitIds: !createNewTruck && truck ? truck.businessUnits.map(elem => elem.id) : [],
    licensePlate: !createNewTruck && truck ? truck.licensePlate : '',
    note: !createNewTruck && truck ? truck.note : '',
    truckTypeId: !createNewTruck && truck ? truck.truckType.id : undefined,
  };
};
