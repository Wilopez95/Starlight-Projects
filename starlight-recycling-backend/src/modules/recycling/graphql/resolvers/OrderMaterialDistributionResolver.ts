import { Resolver, FieldResolver, Root, Ctx } from 'type-graphql';

import { OrderMaterialDistribution } from '../../entities/OrderMaterialDistribution';
import { QueryContext } from '../../../../types/QueryContext';
import { getHaulingMaterial } from '../../../../services/core/haulingMaterials';
import { HaulingMaterial } from '../../../../services/core/types/HaulingMaterial';

@Resolver(() => OrderMaterialDistribution)
export default class OrderMaterialDistributionResolver {
  @FieldResolver(() => HaulingMaterial, { nullable: true })
  async material(
    @Root() orderMaterialDistribution: OrderMaterialDistribution,
    @Ctx() ctx: QueryContext,
  ): Promise<HaulingMaterial> {
    if (orderMaterialDistribution.material) {
      return orderMaterialDistribution.material;
    }

    return getHaulingMaterial(ctx, orderMaterialDistribution.materialId);
  }
}
