import { sumBy } from 'lodash-es';

import { LandfillOperation } from '@root/stores/landfillOperation/LandfillOperation';
import { IEditableLandfillOperation } from '@root/types';

const checkIsIntegerAndFixed = (value: number): number => {
  const fixedValue = Number.isInteger(value) ? value : value.toFixed(2);

  return Number(fixedValue);
};

export const getInitialValues = (operation: LandfillOperation): IEditableLandfillOperation => {
  const {
    arrivalDate = new Date(),
    departureDate = new Date(),
    store: _,
    ...otherProps
  } = operation;

  return {
    ...otherProps,
    arrivalDate,
    departureDate,
    weightOut: checkIsIntegerAndFixed(operation.weightOut),
    weightIn: checkIsIntegerAndFixed(operation.weightIn),
    netWeight: checkIsIntegerAndFixed(operation.netWeight),
    materialsTotal: sumBy(otherProps.materials, x => x.value),
  };
};
