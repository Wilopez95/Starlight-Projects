import {
  HaulingHttpCrudService,
  ListResponseBasic,
  PartialContext,
} from '../../graphql/createHaulingCRUDResolver';
import { Equipment, EquipmentInput, EquipmentUpdateInput } from './types/Equipment';
import { ParsedUrlQueryInput } from 'querystring';
import PaginationInput from '../../graphql/types/PaginationInput';
import SortInput from '../../graphql/types/SortInput';
import { getBusinessUnit } from './business_units';

export class EquipmentHttpService extends HaulingHttpCrudService<
  Equipment,
  EquipmentInput,
  EquipmentUpdateInput
> {
  path = 'equipment-items';

  async get(
    ctx: PartialContext,
    filter: ParsedUrlQueryInput = {},
    pagination?: PaginationInput,
    sort?: SortInput<Equipment>[],
    authorization?: string,
    tokenPayload?: Record<string, any>,
  ): Promise<ListResponseBasic<Equipment>> {
    const auth = authorization || (await HaulingHttpCrudService.getAuthorizationHeader(ctx));
    const businessUnit = await getBusinessUnit(ctx, auth);
    const businessLineId = businessUnit.businessLines[0]?.id;

    return super.get(ctx, { businessLineId, ...filter }, pagination, sort, auth, tokenPayload);
  }
}
