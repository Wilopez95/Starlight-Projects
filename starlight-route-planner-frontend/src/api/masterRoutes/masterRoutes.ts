import {
  MasterRouteFragment,
  RouteEditingNoticeFragment,
  ServiceItemFragment,
} from '@root/graphql';
import { IMasterRoute, IMasterRouteEditModeNotice, IUnpublishMasterRouteNotice } from '@root/types';

import { IMasterRouteGridItem, IMasterRouteGridUpdate } from '@root/stores/masterRoutes/types';
import { BaseGraphqlService, routePlannerHttpClient } from '../base';

import {
  ICreateMasterRouteParams,
  IMasterRoutesGridFilters,
  IMasterRoutesListParams,
  IUpdateMasterRouteParams,
} from './types';

export class MasterRoutesService extends BaseGraphqlService {
  createMasterRoute(variables: ICreateMasterRouteParams) {
    return this.graphql<
      { createMasterRoute: IMasterRoute },
      { variables: ICreateMasterRouteParams }
    >(
      `mutation CreateMasterRoute($variables: CreateMasterRouteInput!) {
        createMasterRoute(input: $variables) {
          ${MasterRouteFragment}
          serviceItems {
            ${ServiceItemFragment}
          }
        }
      }`,
      {
        variables,
      },
    );
  }

  updateMasterRoute(variables: IUpdateMasterRouteParams) {
    return this.graphql<
      { updateMasterRoute: IMasterRoute },
      { variables: IUpdateMasterRouteParams }
    >(
      `mutation UpdateMasterRoute($variables: UpdateMasterRouteInput!) {
        updateMasterRoute(input: $variables) {
          ${MasterRouteFragment}
          serviceItems {
            ${ServiceItemFragment}
          }
        }
      }`,
      {
        variables,
      },
    );
  }

  enableEditMode(id: number) {
    return this.graphql<
      {
        enableMasterRouteEditMode: (IMasterRoute | IMasterRouteEditModeNotice) & {
          __typename: string;
        };
      },
      { id: number }
    >(
      `mutation EnableMasterRouteEditMode($id: Int!) {
        enableMasterRouteEditMode(id: $id) {
          __typename
          ... on EnableEditModeNotice {
            ${RouteEditingNoticeFragment}
          }

          ... on MasterRoute {
            ${MasterRouteFragment}
            serviceItems {
              ${ServiceItemFragment}
            }
          }
        }
      }`,
      {
        id,
      },
    );
  }

  disableEditMode(id: number) {
    return this.graphql<{ disableMasterRouteEditMode: IMasterRoute }, { id: number }>(
      `mutation DisableMasterRouteEditMode($id: Int!) {
        disableMasterRouteEditMode(id: $id) {
          ${MasterRouteFragment}
          serviceItems {
            ${ServiceItemFragment}
          }
        }
      }`,
      {
        id,
      },
    );
  }

  publishMasterRoute(variables: { id: number; publishDate: string }) {
    return this.graphql<{ publishMasterRoute: IMasterRoute }, { id: number; publishDate: string }>(
      `mutation PublishMasterRoute($id: Int!, $publishDate: String!) {
        publishMasterRoute(id: $id, publishDate: $publishDate) {
          ${MasterRouteFragment}
          serviceItems {
            ${ServiceItemFragment}
          }
        }
      }`,
      variables,
    );
  }

  unpublishMasterRoute(id: number, force: boolean) {
    return this.graphql<
      {
        unpublishMasterRoute: (IMasterRoute | IUnpublishMasterRouteNotice) & {
          __typename: string;
        };
      },
      { id: number; force: boolean }
    >(
      `mutation UnpublishMasterRoute($id: Int!, $force: Boolean!) {
        unpublishMasterRoute(id: $id, force: $force) {
          __typename
          ... on UnpublishMasterRouteNotice {
            dailyRoutesToDeleteCount
            editedDailyRoutes {
              id
              name
              serviceDate
              workOrders {
                id
              }
            }
          }

          ... on MasterRoute {
            ${MasterRouteFragment}
            serviceItems {
              ${ServiceItemFragment}
            }
          }
        }
      }`,
      {
        id,
        force,
      },
    );
  }

  getUpdatingMasterRoute(businessUnitId: number) {
    return this.graphql<
      {
        updatingMasterRoutesList: [{ id: number; name: string; status: string }];
      },
      { businessUnitId: number }
    >(
      `query CurrentlyUpdatingMasterRoute($businessUnitId: Int!) {
        updatingMasterRoutesList(businessUnitId: $businessUnitId) {
          id
          name
          status
        }
      }`,
      {
        businessUnitId,
      },
    );
  }

  getMasterRoutesList(variables: IMasterRoutesListParams) {
    return this.graphql<{ masterRoutes: IMasterRoute[] }, IMasterRoutesListParams>(
      `
        query MasterRoutes($businessUnitId: Int!, $input: MasterRouteFilters!) {
          masterRoutes(businessUnitId: $businessUnitId, input: $input) {
            ${MasterRouteFragment}
            serviceItems {
              ${ServiceItemFragment}
            }
          }
        }
      `,
      { ...variables },
    );
  }

  getMasterRoute(id: number) {
    return this.graphql<{ masterRoute: IMasterRoute }, { id: number }>(
      `
        query MasterRoute($id: Int!) {
          masterRoute(id: $id) {
            ${MasterRouteFragment}
            serviceItems {
              ${ServiceItemFragment}
            }
          }
        }
      `,
      {
        id,
      },
    );
  }

  getCount(businessUnitId: number) {
    return this.graphql<{ masterRoutesCount: { count: number } }, { businessUnitId: number }>(
      `
        query MasterRoutesCount($businessUnitId: Int!) {
          masterRoutesCount(businessUnitId: $businessUnitId) {
            count
          }
        }
      `,
      {
        businessUnitId,
      },
    );
  }

  getAvailableColor() {
    return this.graphql<{ availableMasterRouteColor: { color: string } }>(
      `
        query AvailableMasterRouteColor {
          availableMasterRouteColor {
            color
          }
        }
      `,
    );
  }

  getMasterRouteGrid(businessUnitId: number, filters: IMasterRoutesGridFilters) {
    return routePlannerHttpClient.graphql<
      {
        masterRouteGrid: IMasterRouteGridItem[];
      },
      {
        businessUnitId: number;
        filters: {
          skip: number;
          limit: number;
          sortBy: string;
          sortOrder: string;
        };
      }
    >(
      `
        query masterRouteGrid ($businessUnitId: Int!, $filters: MasterRouteFilters!) {
          masterRouteGrid (businessUnitId: $businessUnitId, filters: $filters)
          {
            id,
            customerId,
            customerName,
            subscriptionId,
            jobSiteId,
            jobSiteName,
            serviceName,
            serviceFrequencyId,
            serviceFrequencyName,
            materialId,
            materialName,
            equipmentItemId,
            equipmentSize,
            currentRoute,
            currentSequence,
            currentServiceDay,
            routeId,
            serviceItemMasterRouteId
          }
        }`,
      {
        businessUnitId,
        filters,
      },
    );
  }

  updateMasterRouteGrid(variables: IMasterRouteGridUpdate) {
    return routePlannerHttpClient.graphql<
      { updateMasterRouteGrid: IMasterRouteGridUpdate[] },
      { variables: IMasterRouteGridUpdate }
    >(
      `
        mutation updateMasterRouteGrid ($variables: UpdateMasterRouteGridInput!) {
          updateMasterRouteGrid (input: $variables)
          {
            list
          }
        }`,
      {
        variables,
      },
    );
  }
}
