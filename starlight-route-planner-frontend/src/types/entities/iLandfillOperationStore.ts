import { IStoreCount } from '../counts';
import { IEntity } from './entity';

export interface ILandfillOperationStore extends IEntity {
  counts?: IStoreCount;
}
