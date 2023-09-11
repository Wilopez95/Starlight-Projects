import { Resolver, FieldResolver, Root, Ctx } from 'type-graphql';

import { OrderMiscellaneousMaterialDistribution } from '../../entities/OrderMiscellaneousMaterialDistribution';
import { QueryContext } from '../../../../types/QueryContext';
import { getHaulingMaterial } from '../../../../services/core/haulingMaterials';
import { HaulingMaterial } from '../../../../services/core/types/HaulingMaterial';

@Resolver(() => OrderMiscellaneousMaterialDistribution)
export default class OrderMiscellaneousMaterialDistributionResolver {
  @FieldResolver(() => HaulingMaterial)
  async material(
    @Root() orderMiscellaneousMaterialDistribution: OrderMiscellaneousMaterialDistribution,
    @Ctx() ctx: QueryContext,
  ): Promise<HaulingMaterial> {
    if (orderMiscellaneousMaterialDistribution.material) {
      return orderMiscellaneousMaterialDistribution.material;
    }

    return getHaulingMaterial(ctx, orderMiscellaneousMaterialDistribution.materialId);
  }
}
