import { Context } from '../../types/Context';
import { parseFacilitySrn } from '../../utils/srn';
import { HaulingOrigin, OriginInput } from './types/HaulingOrigin';
import { ParsedUrlQueryInput } from 'querystring';
import { HaulingHttpCrudService } from '../../graphql/createHaulingCRUDResolver';
import PaginationInput from '../../graphql/types/PaginationInput';
import SortInput from '../../graphql/types/SortInput';

export class HaulingOriginHttpService extends HaulingHttpCrudService<HaulingOrigin, OriginInput> {
  path = 'origins';

  async get(
    ctx: Context,
    filter?: ParsedUrlQueryInput,
    pagination?: PaginationInput,
    sort?: SortInput<HaulingOrigin>[],
    authorization?: string,
  ) {
    const { businessUnitId } = parseFacilitySrn(ctx.userInfo.resource!);

    return super.get(
      ctx,
      {
        ...filter,
        filterByBusinessUnits: businessUnitId,
      },
      pagination,
      sort,
      authorization,
    );
  }

  async create(ctx: Context, data: HaulingOrigin, authorization?: string): Promise<HaulingOrigin> {
    const { businessUnitId } = parseFacilitySrn(ctx.userInfo.resource!);

    return super.create(
      ctx,
      {
        ...data,
        businessUnitId,
      },
      authorization,
    );
  }

  async update(ctx: Context, data: HaulingOrigin, authorization?: string): Promise<HaulingOrigin> {
    const { businessUnitId } = parseFacilitySrn(ctx.userInfo.resource!);

    return super.update(
      ctx,
      {
        ...data,
        businessUnitId,
      },
      authorization,
    );
  }
}
