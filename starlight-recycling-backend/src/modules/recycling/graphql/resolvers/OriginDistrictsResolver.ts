import { Resolver, Ctx, Query, Arg } from 'type-graphql';
import { QueryContext } from 'src/types/QueryContext';
import { HaulingOriginDistrict } from '../../../../services/core/types/HaulingOriginDistrict';
import { Authorized } from '../../../../graphql/decorators/Authorized';
import { HaulingOriginDistrictHttpService } from '../../../../services/core/haulingOriginDistricts';
import {
  getTaxDistricts,
  getTaxDistrictsForOrder,
} from '../../../../services/core/haulingTaxDistrict';
import {
  HaulingTaxDistrict,
  TaxDistrictFilter,
} from '../../../../services/core/types/HaulingTaxDistrict';

@Resolver(() => HaulingOriginDistrict)
export default class OriginDistrictResolver {
  @Authorized([
    'recycling:OriginDistrict:list',
    'recycling:SelfService:list',
    'recycling:YardConsole:perform',
  ])
  @Query(() => [HaulingOriginDistrict])
  async activeOriginDistricts(@Ctx() ctx: QueryContext): Promise<HaulingOriginDistrict[]> {
    const response = await new HaulingOriginDistrictHttpService().getAll(
      ctx,
      { activeOrigins: true },
      [{ field: 'state', order: 'ASC' }],
    );

    return response.data;
  }

  @Authorized()
  @Query(() => [HaulingTaxDistrict])
  async taxDistricts(@Ctx() ctx: QueryContext): Promise<HaulingTaxDistrict[]> {
    return getTaxDistricts(ctx);
  }

  @Authorized()
  @Query(() => [HaulingTaxDistrict])
  async taxDistrictsForOrder(
    @Ctx() ctx: QueryContext,
    @Arg('filter', () => TaxDistrictFilter) filter: TaxDistrictFilter,
  ): Promise<HaulingTaxDistrict[]> {
    return getTaxDistrictsForOrder(ctx, filter);
  }
}
