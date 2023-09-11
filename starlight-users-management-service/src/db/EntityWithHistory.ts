import { BeforeInsert, BeforeUpdate, BeforeRemove } from 'typeorm';
import { ObjectType } from 'type-graphql';

import { EntityWithUserInfo } from './EntityWithUserInfo';
import { AuditAction, AuditEntity } from './AuditAction';

@ObjectType({ isAbstract: true })
export abstract class EntityWithHistory extends EntityWithUserInfo {
  action = AuditAction.CREATE;

  @BeforeInsert()
  protected setInsertAction(): void {
    this.action = AuditAction.CREATE;
  }

  @BeforeUpdate()
  protected setUpdateAction(): void {
    this.action = AuditAction.MODIFY;
  }

  @BeforeRemove()
  protected setRemoveAction(): void {
    this.action = AuditAction.DELETE;
  }

  abstract entity: AuditEntity;

  abstract getByIdToLog(id: string): Promise<EntityWithHistory | undefined>;
}
