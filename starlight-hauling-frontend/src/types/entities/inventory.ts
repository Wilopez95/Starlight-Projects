import { type IEntity } from './';

export interface IInventory extends IEntity {
  businessUnitId: number;
  equipmentItemId: number;
  totalQuantity: number;
  onJobSiteQuantity: number;
  onRepairQuantity: number;
  description: string;
}
