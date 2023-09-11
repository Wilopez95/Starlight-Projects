import { Resolver, Query, Ctx, FieldResolver, Root, Authorized } from 'type-graphql';

import { ResolverContext } from '../../context';
import { User } from '../../entities/User';
import { adaptAccessConfig } from '../../services/policyAdapter';
import { Me } from '../types/Me';

@Resolver(() => Me)
export class MeResolver {
  @Authorized()
  @Query(() => Me)
  me(@Ctx() ctx: ResolverContext): Me {
    return {
      ...ctx.userInfo,
      id: ctx.userInfo?.id ?? 'system',
      name: ctx.userInfo?.name ?? 'system',
      permissions: ctx.userInfo?.access ? adaptAccessConfig(ctx.userInfo.access) : [],
    };
  }

  @Authorized()
  @FieldResolver(() => [String])
  async permissions(@Root() me: Me): Promise<string[]> {
    const { id, resource } = me;

    if (!resource) {
      return [];
    }

    const user = await User.findOneOrFail(id, {
      relations: ['policies', 'roles', 'roles.policies'],
    });

    return adaptAccessConfig(user.getPermissionsForResource(resource));
  }

  @Authorized()
  @FieldResolver(() => String, { nullable: true })
  async firstName(@Root() me: Me): Promise<string | undefined> {
    if (me.user) {
      return me.user.firstName;
    }

    me.user = await User.findOne(me.id);

    return me.user?.firstName;
  }

  @Authorized()
  @FieldResolver(() => String, { nullable: true })
  async lastName(@Root() me: Me): Promise<string | undefined> {
    if (me.user) {
      return me.user.lastName;
    }

    me.user = await User.findOne(me.id);

    return me.user?.lastName;
  }
}
