import { OriginInput } from './types/HaulingOrigin';
import { HaulingHttpCrudService, ListResponseBasic } from '../../graphql/createHaulingCRUDResolver';
import { HaulingOriginDistrict } from './types/HaulingOriginDistrict';
import { Context } from '../../types/Context';
import { ParsedUrlQueryInput } from 'querystring';
import SortInput from '../../graphql/types/SortInput';
import { parseFacilitySrn } from '../../utils/srn';

export class HaulingOriginDistrictHttpService extends HaulingHttpCrudService<
  HaulingOriginDistrict,
  OriginInput
> {
  path = 'origins/districts';

  async getAll(
    ctx: Context,
    filter: ParsedUrlQueryInput = {},
    sort?: SortInput<HaulingOriginDistrict>[],
    authorization?: string,
  ): Promise<ListResponseBasic<HaulingOriginDistrict>> {
    const { businessUnitId } = parseFacilitySrn(ctx.userInfo.resource!);

    return super.getAll(
      ctx,
      {
        ...filter,
        filterByBusinessUnits: businessUnitId,
      },
      sort,
      authorization,
    );
  }
}
