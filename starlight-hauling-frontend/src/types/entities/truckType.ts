import { IEntity } from './entity';

export interface IEquipmentOrMaterialsItems {
  id: number;
  description: string;
  active?: boolean;
}
export interface FormikBusinessLines {
  id: number;
  materials: IEquipmentOrMaterialsItems[];
  equipmentItems: IEquipmentOrMaterialsItems[];
  active: boolean;
  name: string;
}
export interface IBusinessLineItem {
  id: number;
  name: string;
  equipments?: IEquipmentOrMaterialsItems[];
  materials?: IEquipmentOrMaterialsItems[];
}

export interface IBusinessLinesPostData {
  id: number;
  materialsIds: number[];
  equipmentItemsIds: number[];
}

export interface ITruckType extends IEntity {
  active: boolean;
  description: string;
  businessLines: IBusinessLineItem[];
  businessLineNames?: string;
}

export interface ITruckTypeData extends IEntity {
  active: boolean;
  description: string;
  businessLines: IBusinessLinesPostData[];
}

export interface ITruckFormikData {
  id: number;
  active: boolean;
  description: string;
  businessLines: FormikBusinessLines[];
}
