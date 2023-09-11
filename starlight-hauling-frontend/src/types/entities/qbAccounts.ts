import { IEntity } from './entity';

export interface IQbAccounts extends IEntity {
  checked: boolean;
  quickBooksId: string;
  integrationId: number;
  name: string;
  type: string;
}
