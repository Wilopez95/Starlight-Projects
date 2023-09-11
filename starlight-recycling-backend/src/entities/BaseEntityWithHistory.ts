import { BeforeInsert, BeforeUpdate, BeforeRemove } from 'typeorm';
import { ObjectType } from 'type-graphql';
import BaseEntityWithUserInfo from './BaseEntityWithUserInfo';
import Action from './AuditEntityAction';

@ObjectType({ isAbstract: true })
export class BaseEntityWithHistory extends BaseEntityWithUserInfo {
  performedBy: string | null = null;
  reason: string | null = null;
  action: Action = Action.UNKNOWN;

  @BeforeInsert()
  // eslint-disable-next-line
  // @ts-ignore
  private _setInsertAction(): void {
    this.action = Action.CREATE;
    this.performedBy = this._userInfo?.id || null;
  }

  @BeforeUpdate()
  // eslint-disable-next-line
  // @ts-ignore
  private _setUpdateAction(): void {
    this.action = Action.UPDATE;
    this.performedBy = this._userInfo?.id || null;
  }

  @BeforeRemove()
  // eslint-disable-next-line
  // @ts-ignore
  private _setRemoveAction(): void {
    this.action = Action.REMOVE;
    this.performedBy = this._userInfo?.id || null;
  }
}

export default BaseEntityWithHistory;
