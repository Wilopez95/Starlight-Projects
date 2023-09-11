import { IEntity } from '@root/types';

export interface IClockInOut extends IEntity {
  userId: number;
  clockIn: Date;
  clockOut?: Date;
}
