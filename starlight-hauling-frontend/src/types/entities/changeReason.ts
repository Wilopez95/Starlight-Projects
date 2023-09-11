import { IBusinessLine, IEntity } from '@root/types';

export interface IChangeReason extends IEntity {
  active: boolean;
  description: string;
  businessLines: IBusinessLine[];
  businessLineNames: string;
}
