import { Context } from '../../types/Context';
import {
  HaulingCustomerGroup,
  HaulingCustomerGroupInput,
  HaulingCustomerGroupType,
} from './types/HaulingCustomerGroup';
import { HaulingHttpCrudService, PartialContext } from '../../graphql/createHaulingCRUDResolver';

interface HaulingCustomerGroupFilter {
  activeOnly?: boolean | null;
  type?: HaulingCustomerGroupType;
  description?: string;
}

export const getOrCreateCustomerGroup = async (
  ctx: PartialContext,
): Promise<HaulingCustomerGroup> => {
  const groupHttpService = new HaulingCustomerGroupHttpService();
  const response = await groupHttpService.get(ctx, {
    description: 'Hauling BU',
  });
  const group = response?.data?.[0];

  if (group) {
    return group;
  }

  return groupHttpService.create(ctx, {
    active: true,
    description: 'Hauling BU',
    type: HaulingCustomerGroupType.COMMERCIAL,
  });
};

export const getCustomerGroups = async (
  ctx: Context,
  { activeOnly, type }: HaulingCustomerGroupFilter = {},
): Promise<HaulingCustomerGroup[]> => {
  const response = await new HaulingCustomerGroupHttpService().get(ctx, {
    activeOnly,
    type,
  });

  return response.data;
};

export class HaulingCustomerGroupHttpService extends HaulingHttpCrudService<
  HaulingCustomerGroup,
  HaulingCustomerGroupInput
> {
  path = 'customer-groups';
}
