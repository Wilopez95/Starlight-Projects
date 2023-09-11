import gql from 'graphql-tag';
import has from 'lodash/has.js';
import { format } from 'date-fns';

import { DB_DATE_FORMAT } from '../consts/formats.js';
import { RESOLVE_TYPE } from '../consts/resolveTypes.js';
import { getFrequencyDescription } from '../utils/getFrequencyDescription.js';

export const typeDefs = gql`
  input CreateMasterRouteInput {
    name: String!
    businessUnitId: Int!
    serviceDaysList: [Int!]!
    color: String!
    serviceItems: [ServiceItemInput!]!
    truckId: String
    driverId: Int
  }

  input UpdateMasterRouteInput {
    id: Int!
    serviceItems: [ServiceItemInput!]!
    serviceDaysList: [Int!]
    name: String
    truckId: String
    driverId: Int
  }

  input UpdateMasterRouteGridInput {
    data: [UpdateMasterRoutesData!]
  }

  input UpdateMasterRoutesData {
    id: Int!
    serviceItemMasterRouteId: Int
    newRoute: Int
    newSequence: Int
    newServiceDay: Int
  }

  type UpdateMasterRouteGrid {
    list: [Int!]
  }

  type MasterRouteGridList {
    id: Int
    serviceItemMasterRouteId: Int
    newRoute: Int
    newSequence: Int
    newServiceDay: Int
    createdAt: String
    updatedAt: String
  }

  enum MASTER_ROUTES_SORTING_COLUMN {
    customerName
    subscriptionId
    jobSiteName
    serviceName
    serviceFrequencyName
    materialName
    equipmentSize
    currentRoute
    currentSequence
    currentServiceDay
  }

  input MasterRouteFilters {
    businessLineTypes: [BUSINESS_LINE_ROUTE_TYPE!]
    serviceAreaIds: [Int]
    materialIds: [Int]
    equipmentIds: [Int]
    frequencyIds: [Int]
    serviceDay: [Int]
    businessLineId: Int
    published: Boolean
    routeId: Int
    skip: Int
    limit: Int
    sortBy: MASTER_ROUTES_SORTING_COLUMN
    sortOrder: SORT_ORDER_ENUM
  }

  type MasterRoute {
    id: Int!
    published: Boolean!
    serviceDaysList: [Int!]
    assignedServiceDaysList: [Int!]
    businessUnitId: Int!
    name: String!
    color: String!
    numberOfStops: Int
    businessLineType: BUSINESS_LINE_ROUTE_TYPE
    status: MASTER_ROUTE_STATUS_ENUM
    publishDate: String
    truckId: String
    driverId: Int
    serviceItems: [ServiceItem]
    violation: [ROUTE_VIOLATION]
    editingBy: String
    editorId: String
    createdAt: String
    updatedAt: String
  }

  type UnpublishMasterRouteNotice {
    dailyRoutesToDeleteCount: Int!
    editedDailyRoutes: [DailyRoute!]
  }

  union UnpublishMasterRouteResult = MasterRoute | UnpublishMasterRouteNotice

  type UpdatingMasterRouteInfo {
    id: Int!
    name: String
    status: MASTER_ROUTE_STATUS_ENUM
  }

  type MasterRouteGrid {
    id: Int!
    customerId: Int
    customerName: String
    subscriptionId: String
    jobSiteId: Int
    jobSiteName: String
    serviceName: String
    serviceFrequencyId: Int
    serviceFrequencyName: String
    materialId: Int
    materialName: String
    equipmentItemId: Int
    equipmentSize: String
    currentRoute: String
    currentSequence: Int
    currentServiceDay: Int
    routeId: Int
    serviceItemMasterRouteId: Int
  }

  type MasterRouteCount {
    count: Int!
  }

  type MasterRouteColor {
    color: String!
  }

  union EnableMasterRouteEditModeResult = MasterRoute | EnableEditModeNotice
`;

export const resolvers = {
  MasterRoute: {
    publishDate: ({ publishDate }) => (publishDate ? format(publishDate, DB_DATE_FORMAT) : null),
  },
  MasterRouteColor: {
    color: color => color,
  },
  UnpublishMasterRouteResult: {
    __resolveType(obj) {
      if (has(obj, 'dailyRoutesToDeleteCount') || has(obj, 'editedDailyRoutes')) {
        return RESOLVE_TYPE.unpublishMasterRouteNotice;
      }

      if (has(obj, 'id')) {
        return RESOLVE_TYPE.masterRoute;
      }

      return null;
    },
  },
  EnableMasterRouteEditModeResult: {
    __resolveType(res) {
      if (res.id) {
        return RESOLVE_TYPE.masterRoute;
      }

      if (res.currentlyEditingBy) {
        return RESOLVE_TYPE.enableEditModeNotice;
      }

      return null;
    },
  },
  MasterRouteGrid: {
    serviceFrequencyName: ({ times, type }) => getFrequencyDescription({ times, type }),
    // materialName: ({ material }) => material.description,
    // equipmentSize: ({ equipment }) => equipment.description,
    // customerName: ({ customer }) => customer.name,
  },
};
