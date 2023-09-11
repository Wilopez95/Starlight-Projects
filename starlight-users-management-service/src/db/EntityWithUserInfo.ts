import { ObjectType } from 'type-graphql';

import { type Context, type UserInfo } from '../context';
import { BaseEntity } from './BaseEntity';

type PartialUserInfo = Pick<UserInfo, 'id' | 'resource' | 'email' | 'firstName' | 'lastName'>;

interface PartialContext extends Partial<Omit<Context, 'userInfo'>> {
  userInfo?: PartialUserInfo;
}

@ObjectType({ isAbstract: true })
export class EntityWithUserInfo extends BaseEntity {
  protected userInfo?: PartialUserInfo;

  useContext(ctx: PartialContext): void {
    super.useContext(ctx);

    this.userInfo = ctx.userInfo;
  }
}
