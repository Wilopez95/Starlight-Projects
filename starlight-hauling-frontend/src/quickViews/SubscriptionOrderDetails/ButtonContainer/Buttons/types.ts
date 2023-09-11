import { UpdateStatusFunction } from '../types';

export interface IButtons {
  onSubmit(callback: UpdateStatusFunction): void;
}
