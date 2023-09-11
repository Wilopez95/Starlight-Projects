import { IChangeReason } from '@root/types';

export interface IChangeReasonFormData
  extends Omit<IChangeReason, 'businessLines' | 'businessLineNames'> {
  businessLineIds: number[];
}
