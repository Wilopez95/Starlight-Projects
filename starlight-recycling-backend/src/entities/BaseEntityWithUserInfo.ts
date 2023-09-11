import { ObjectType } from 'type-graphql';

import BaseEntityClass from './BaseEntity';
import Me from '../types/Me';
import { UserContext } from '../types/UserContext';

@ObjectType({ isAbstract: true })
export class BaseEntityWithUserInfo extends BaseEntityClass {
  _userInfo?: Me;
  _reqId?: string;

  useContext(ctx: UserContext): void {
    super.useContext(ctx);

    this._userInfo = ctx.userInfo;
    this._reqId = ctx?.reqId;
  }
}

export default BaseEntityWithUserInfo;
