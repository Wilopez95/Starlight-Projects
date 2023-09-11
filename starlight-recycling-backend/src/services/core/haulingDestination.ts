import { Context } from '../../types/Context';
import { parseFacilitySrn } from '../../utils/srn';
import { ParsedUrlQueryInput } from 'querystring';
import { HaulingHttpCrudService } from '../../graphql/createHaulingCRUDResolver';
import PaginationInput from '../../graphql/types/PaginationInput';
import SortInput from '../../graphql/types/SortInput';
import { HaulingDestination, HaulingDestinationInput } from './types/HaulingDestination';

export class HaulingDestinationHttpService extends HaulingHttpCrudService<
  HaulingDestination,
  HaulingDestinationInput
> {
  path = 'destinations';

  async get(
    ctx: Context,
    filter?: ParsedUrlQueryInput,
    pagination?: PaginationInput,
    sort?: SortInput<HaulingDestination>[],
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

  async create(
    ctx: Context,
    data: HaulingDestination,
    authorization?: string,
  ): Promise<HaulingDestination> {
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

  async update(
    ctx: Context,
    data: HaulingDestination,
    authorization?: string,
  ): Promise<HaulingDestination> {
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
