import { IEntity } from './entity';

export type DomainAuthenticationStatus = 'pending' | 'validated';

export interface IDomain extends IEntity {
  name: string;
  validationStatus: DomainAuthenticationStatus;
}
