import gql from 'graphql-tag';
import { format } from 'date-fns';

import { DB_DATE_FORMAT } from '../consts/formats.js';
import { RESOLVE_TYPE } from '../consts/resolveTypes.js';
import { RELATIONS } from '../consts/relations.js';
import { countCompletionRate } from '../utils/routeHelpers.js';

export const typeDefs = gql`
  input CreateDailyRouteInput {
    name: String!
    serviceDate: String!
    color: String!
    workOrderIds: [Int!]!
    truckId: String!
    driverId: Int!
  }

  input UpdateDailyRouteInput {
    id: Int!
    name: String!
    workOrderIds: [Int!]!
    driverId: Int!
    truckId: String!
  }

  input UpdateDailyRouteTrashapi {
    clockIn: String
    clockOut: String
    odometerStart: Float
    odometerEnd: Float
    status: DAILY_ROUTE_STATUS
    completedAt: String
  }

  input UpdateDailyRouteQuickViewInput {
    name: String
    status: DAILY_ROUTE_STATUS
    driverId: Int
    clockIn: String
    clockOut: String
    truckId: String
    odometerStart: Float
    odometerEnd: Float
  }

  input DailyRouteFilters {
    serviceDate: String
    businessLineTypes: [BUSINESS_LINE_ROUTE_TYPE!]
    serviceAreaIds: [Int!]
    skip: Int
    limit: Int
  }

  type DailyRoute {
    id: Int!
    status: DAILY_ROUTE_STATUS!
    name: String!
    serviceDate: String!
    businessUnitId: Int!
    color: String!
    workOrders: [WorkOrder!]!
    isEdited: Boolean!
    driverId: Int!
    truckId: String!
    weightTickets: [WeightTicket!]
    businessLineType: BUSINESS_LINE_ROUTE_TYPE
    parentRouteId: Int
    parentRoute: MasterRoute
    editingBy: String
    createdAt: String
    updatedAt: String
    clockIn: String
    clockOut: String
    odometerStart: Float
    odometerEnd: Float
    unitOfMeasure: UNIT_OF_MEASURE
    driverName: String
    truckType: String
    completedAt: Timestamp
    numberOfStops: Int
    numberOfWos: Int
    completionRate: Int
    violation: [ROUTE_VIOLATION]
    uniqueAssignmentViolation: [TRUCK_DRIVER_UNIQUENESS_VIOLATION]
  }

  input DailyRouteForDashboardFilters {
    serviceDate: String!
    businessLineTypes: [BUSINESS_LINE_ROUTE_TYPE!]
    serviceAreaIds: [Int!]
    statuses: [DAILY_ROUTE_STATUS!]
    truckTypes: [String!]
  }

  type DailyRouteCount {
    count: Int!
  }

  type DailyRouteColor {
    color: String!
  }

  union EnableDailyRouteEditModeResult = DailyRoute | EnableEditModeNotice
`;

export const resolvers = {
  DailyRoute: {
    serviceDate: ({ serviceDate }) => format(serviceDate, DB_DATE_FORMAT),
    parentRoute: obj => obj.$relatedQuery(RELATIONS.MASTER_ROUTE),
    workOrders: obj => (obj.workOrders ? obj.workOrders : obj.$relatedQuery(RELATIONS.WORK_ORDERS)),
    numberOfStops: async obj => {
      if (obj.numberOfStops) {
        return obj.numberOfStops;
      }

      const [{ count }] = await obj.$relatedQuery(RELATIONS.WORK_ORDERS).countDistinct('jobSiteId');

      return count;
    },
    numberOfWos: async obj => {
      if (obj.numberOfWos) {
        return obj.numberOfWos;
      }

      const [{ count }] = await obj.$relatedQuery(RELATIONS.WORK_ORDERS).count();

      return count;
    },
    completionRate: async obj => {
      const workOrders = await obj.$relatedQuery(RELATIONS.WORK_ORDERS);

      return countCompletionRate({ workOrders });
    },
    uniqueAssignmentViolation: ({
      $modelClass,
      uniqueAssignmentViolation,
      serviceDate,
      truckId,
      driverId,
    }) =>
      uniqueAssignmentViolation ||
      $modelClass.checkTruckDriverUniqueErrorsOnOne({ serviceDate, truckId, driverId }),
    weightTickets: obj => obj.$relatedQuery(RELATIONS.WEIGHT_TICKETS),
  },
  DailyRouteColor: {
    color: color => color,
  },
  DailyRouteCount: {
    count: result => result?.count ?? 0,
  },
  EnableDailyRouteEditModeResult: {
    __resolveType(res) {
      if (res.id) {
        return RESOLVE_TYPE.dailyRoute;
      }

      if (res.currentlyEditingBy) {
        return RESOLVE_TYPE.enableEditModeNotice;
      }

      return null;
    },
  },
};
