import { Ctx, FieldResolver, Resolver, Root } from 'type-graphql';
import { HaulingBillableItem } from '../../entities/BillableItem';
import { Authorized } from '../../../../graphql/decorators/Authorized';
import { HaulingMaterial } from '../../../../services/core/types/HaulingMaterial';
import { QueryContext } from '../../../../types/QueryContext';
import { materialService } from '../../../../services/core/haulingMaterials';

@Resolver(() => HaulingBillableItem)
export default class HaulingBillableItemResolver {
  @Authorized(['configuration:materials:list', 'recycling:YardConsole:perform'])
  @FieldResolver(() => [HaulingMaterial])
  async materials(
    @Root() billableItem: HaulingBillableItem,
    @Ctx() ctx: QueryContext,
  ): Promise<HaulingMaterial[]> {
    if (billableItem.materials) {
      return billableItem.materials;
    }

    if (!billableItem.materialIds?.length) {
      return [];
    }

    const response = await materialService.getByIds(ctx, billableItem.materialIds);

    return response.data;
  }
}
