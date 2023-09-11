import { Resolver, FieldResolver, Root, Ctx, Maybe } from 'type-graphql';

import { OrderBillableItem } from '../../entities/OrderBillableItem';
import { HaulingBillableItem } from '../../entities/BillableItem';
import { QueryContext } from '../../../../types/QueryContext';
import { HaulingMaterial } from '../../../../services/core/types/HaulingMaterial';
import { getHaulingMaterial } from '../../../../services/core/haulingMaterials';
import { HaulingBillableItemsHttpService } from '../../../../services/core/haulingBillableItems';

@Resolver(() => OrderBillableItem)
export default class OrderBillableItemResolver {
  @FieldResolver(() => HaulingMaterial, { nullable: true })
  async material(
    @Root() orderBillableItem: OrderBillableItem,
    @Ctx() ctx: QueryContext,
  ): Promise<HaulingMaterial | null> {
    if (orderBillableItem.material) {
      return orderBillableItem.material;
    }

    if (orderBillableItem.materialId) {
      return await getHaulingMaterial(ctx, orderBillableItem.materialId);
    }

    return null;
  }

  @FieldResolver(() => HaulingBillableItem, { nullable: true })
  async billableItem(
    @Root() orderBillableItem: OrderBillableItem,
    @Ctx() ctx: QueryContext,
  ): Promise<Maybe<HaulingBillableItem>> {
    if (orderBillableItem.billableItem) {
      return orderBillableItem.billableItem;
    }

    if (!orderBillableItem.billableItemId) {
      return null;
    }

    return new HaulingBillableItemsHttpService().getById(ctx, orderBillableItem.billableItemId);
  }
}
