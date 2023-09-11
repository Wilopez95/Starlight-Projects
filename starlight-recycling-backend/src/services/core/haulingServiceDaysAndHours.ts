import { HaulingHttpCrudService } from '../../graphql/createHaulingCRUDResolver';
import { HaulingServiceDaysAndHours } from './types/HaulingServiceDaysAndHours';
import { Context } from '../../types/Context';
import { parseFacilitySrn } from '../../utils/srn';
import { ParsedUrlQueryInput } from 'querystring';
import SortInput from '../../graphql/types/SortInput';
import PaginationInput from '../../graphql/types/PaginationInput';

const PATH = 'service-days';
export class HaulingServiceDaysAndHoursHttpService extends HaulingHttpCrudService<
  HaulingServiceDaysAndHours
> {
  path = '';

  async get(
    ctx: Context,
    filter?: ParsedUrlQueryInput,
    pagination?: PaginationInput,
    sort?: SortInput<HaulingServiceDaysAndHours>[],
    authorization?: string,
  ) {
    const { businessUnitId } = parseFacilitySrn(ctx.userInfo.resource!);

    this.path = `business-units/${businessUnitId}/${PATH}`;

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
    data: HaulingServiceDaysAndHours,
    authorization?: string,
  ): Promise<HaulingServiceDaysAndHours> {
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
    data: HaulingServiceDaysAndHours,
    authorization?: string,
  ): Promise<HaulingServiceDaysAndHours> {
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

export const serviceDaysAngHoursServiceService = new HaulingServiceDaysAndHoursHttpService();
