import { type DomainAuthenticationStatus, type IDomain, type JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { DomainStore } from './DomainStore';

export class Domain extends BaseEntity implements IDomain {
  name: string;
  validationStatus: DomainAuthenticationStatus;

  store: DomainStore;

  constructor(store: DomainStore, entity: JsonConversions<IDomain>) {
    super(entity);

    this.store = store;
    this.id = entity.id;
    this.name = entity.name;
    this.validationStatus = entity.validationStatus;
  }
}
