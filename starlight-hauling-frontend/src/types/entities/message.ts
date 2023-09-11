import { IEntity } from './entity';

export interface IMessage extends IEntity {
  message: string;
  authorName: string;
  read: boolean;
  userId: string | null;
  contractorId: number | null;
}
