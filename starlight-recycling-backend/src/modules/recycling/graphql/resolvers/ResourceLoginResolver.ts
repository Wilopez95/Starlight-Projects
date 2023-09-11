import { Resolver, Query, Ctx, Authorized } from 'type-graphql';
import { Context } from '../../../../types/Context';
import { getAvailableResourceLogins } from '../../../../services/core/resource-logins';
import { AvailableResourceLogin } from '../../../../services/core/resource-logins';

@Resolver()
export default class ResourceLoginResolver {
  @Authorized()
  @Query(() => [AvailableResourceLogin], { description: 'Get User Resources' })
  async resourceLogins(@Ctx() ctx: Context): Promise<AvailableResourceLogin[]> {
    const resourceLogins = getAvailableResourceLogins(ctx);

    return resourceLogins;
  }
}
