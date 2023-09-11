import { IEntity } from './Entity';

export enum BusinessLineType {
  rollOff = 'rollOff',
  commercialWaste = 'commercialWaste',
  residentialWaste = 'residentialWaste',
  portableToilets = 'portableToilets',
  recycling = 'recycling',
}

export interface IBusinessLine extends IEntity {
  active: boolean;
  description: string;
  name: string;
  shortName: string;
  type: BusinessLineType;
  spUsed: boolean;
  billingCycle?: string;
  billingType?: string;
}
