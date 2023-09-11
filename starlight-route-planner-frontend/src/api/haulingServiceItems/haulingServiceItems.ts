import { HaulingServiceItemFragment } from '@root/graphql';
import { IHaulingServiceItem } from '@root/types';

import { BaseGraphqlService } from '../base';

import { ICheckServiceItemsRouteStatus, IHaulingServiceItemsQueryParams } from './types';

export class HaulingServiceItemsService extends BaseGraphqlService {
  getHaulingServiceItems(businessUnitId: number, filters: IHaulingServiceItemsQueryParams) {
    return this.graphql<
      { haulingServiceItems: IHaulingServiceItem[] },
      {
        businessUnitId: number;
        filters: IHaulingServiceItemsQueryParams;
      }
    >(
      `
        query HaulingServiceItems($businessUnitId: Int!, $filters: HaulingServiceItemFilters) {
          haulingServiceItems(businessUnitId: $businessUnitId, filters: $filters) {
            ${HaulingServiceItemFragment}
          }
        }
      `,
      {
        filters,
        businessUnitId,
      },
    );
  }

  checkServiceItemsRouteStatus(ids: number[]) {
    return this.graphql<
      { checkServiceItemsRouteStatus: ICheckServiceItemsRouteStatus | null },
      { ids: number[] }
    >(
      `query CheckServiceItemsRouteStatus($ids: [Int!]!) {
        checkServiceItemsRouteStatus(ids: $ids) {
          available
          updating
          published
        }
      }`,
      {
        ids,
      },
    );
  }
}
