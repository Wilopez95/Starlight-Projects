import { type IInventory } from '@root/types';

export interface IUpdateInventoryRequest {
  equipmentItems: Pick<
    IInventory,
    'id' | 'totalQuantity' | 'onRepairQuantity' | 'onJobSiteQuantity'
  >[];
}
