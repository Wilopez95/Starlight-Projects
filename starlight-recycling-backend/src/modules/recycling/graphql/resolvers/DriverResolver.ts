import { Resolver, Ctx, Query } from 'type-graphql';

import { HaulingBillableItem } from '../../entities/BillableItem';
import { QueryContext } from '../../../../types/QueryContext';
import { Authorized } from '../../../../graphql/decorators/Authorized';
import { getBusinessUnit } from '../../../../services/core/business_units';
import { HaulingHttpCrudService } from '../../../../graphql/createHaulingCRUDResolver';
import { HaulingDriver } from '../../entities/HaulingDriver';
import { HaulingTrashApiDriver } from '../../../../services/core/haulingTrashApiDriver';
import { coreErrorHandler } from './utils/coreErrorHandler';

export const getUserDriver = async (ctx: QueryContext): Promise<HaulingDriver> => {
  const auth = await HaulingHttpCrudService.getAuthorizationHeader(ctx);
  const businessUnit = await getBusinessUnit(ctx, auth);

  if (!businessUnit) {
    throw new Error('Business Unit not found');
  }

  const response = await new HaulingTrashApiDriver().get(
    ctx,
    { email: ctx.userInfo.email },
    undefined,
    undefined,
    auth,
  );

  return response.data[0];
};

@Resolver(() => HaulingBillableItem)
export default class DriverResolver {
  @Authorized(['recycling:SelfService:perform'])
  @Query(() => HaulingDriver, { name: 'userDriver', nullable: true })
  async getUserDriver(@Ctx() ctx: QueryContext): Promise<HaulingDriver> {
    try {
      return await getUserDriver(ctx);
    } catch (e) {
      coreErrorHandler(ctx, e);
    }
  }
}
