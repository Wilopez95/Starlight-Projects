import * as Yup from 'yup';

import { type IUpdateInventoryRequest } from '@root/api/inventory/types';
import { type IInventory } from '@root/types';

export const getInventoryInitialValues = (inventoryItems: IInventory[]) => {
  return {
    inventory: [...inventoryItems],
  };
};

export type FormDataType = ReturnType<typeof getInventoryInitialValues>;

export const inventoryValidationSchema = Yup.object().shape({
  inventory: Yup.array().of(
    Yup.object().shape({
      totalQuantity: Yup.number().min(0),
      onRepairQuantity: Yup.number().min(0),
    }),
  ),
});

export const normalize = (inventory: IInventory[]): IUpdateInventoryRequest => {
  return {
    equipmentItems: inventory.map(
      ({ equipmentItemId, totalQuantity, onRepairQuantity, onJobSiteQuantity }) => {
        return {
          id: equipmentItemId,
          totalQuantity,
          onRepairQuantity,
          onJobSiteQuantity,
        };
      },
    ),
  };
};
