import { IEquipmentItem, IMaterial } from '../entities';

export interface IResponseMaterial extends IMaterial {
  equipmentItems: IEquipmentItem[];
  id: number;
}
