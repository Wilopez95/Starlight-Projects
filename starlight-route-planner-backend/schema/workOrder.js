import gql from 'graphql-tag';
import { format } from 'date-fns';

import { DB_DATE_FORMAT } from '../consts/formats.js';
import { RELATIONS } from '../consts/relations.js';
import { RESOLVE_TYPE } from '../consts/resolveTypes.js';
import { trashapiNotesCount } from './query/trashapi/index.js';

export const typeDefs = gql`
  input UpdateWorkOrderInput {
    id: Int!
    status: WORK_ORDER_STATUS_ENUM
    serviceDate: String
    assignedRoute: String
    cancellationReason: CANCELLATION_REASON
    cancellationComment: String
    pickedUpEquipment: String
    droppedEquipment: String
    weight: Float
  }

  input UpdateWorkOrderTrashapi {
    status: WORK_ORDER_STATUS_ENUM
    comment: String
    media: String
    longitude: Float!
    latitude: Float!
  }

  input WorkOrderDailyRouteFilters {
    businessLineId: Int!
    serviceDate: String!
    serviceAreaIds: [Int!]
    materialIds: [Int!]
    equipmentItemIds: [Int!]
  }

  input WorkOrderFilters {
    serviceDate: String!
    businessLineIds: [Int!]
    serviceAreaIds: [Int!]
    status: [WORK_ORDER_STATUS_ENUM!]
    thirdPartyHaulerIds: [Int]
    assignedRoute: String
    skip: Int
    limit: Int
    sortBy: WORK_ORDER_SORTING_COLUMN
    sortOrder: SORT_ORDER_ENUM
  }

  type WorkOrder {
    id: Int!
    workOrderId: Int!
    displayId: ID!
    orderDisplayId: ID!
    isIndependent: Boolean!
    serviceDate: String!
    status: WORK_ORDER_STATUS_ENUM!
    customerId: Int!
    jobSiteId: Int!
    businessLineId: Int!
    materialId: Int
    equipmentItemId: Int!
    orderId: Int!
    billableServiceId: Int!
    billableServiceDescription: String!
    jobSite: JobSite!
    signatureRequired: Boolean!
    toRoll: Boolean!
    alleyPlacement: Boolean!
    poRequired: Boolean!
    permitRequired: Boolean!
    subscriptionId: Int
    serviceAreaId: Int
    phoneNumber: String
    weightTicket: WeightTicket
    assignedRoute: String
    bestTimeToComeFrom: String
    bestTimeToComeTo: String
    dailyRouteId: Int
    dailyRoute: DailyRoute
    sequence: Int
    instructionsForDriver: String
    cancellationReason: CANCELLATION_REASON
    cancellationComment: String
    completedAt: Timestamp
    pickedUpEquipment: String
    droppedEquipment: String
    weight: Float
    weightUnit: WEIGHT_UNIT_ENUM
    media: [WorkOrderMedia]
    comments: [Comment]
    jobSiteNote: String
    someoneOnSite: Boolean
    highPriority: Boolean
    thirdPartyHaulerId: Int
    thirdPartyHaulerDescription: String
    equipmentItemSize: Float
    notesCount: Int
  }

  input BulkStatusChangeWorkOrderInput {
    ids: [Int!]!
    status: WORK_ORDER_STATUS_ENUM!
    cancellationReason: String
    cancellationComment: String
  }

  input BulkRescheduleWorkOrderInput {
    ids: [Int!]!
    serviceDate: String!
  }

  type BulkActionWorkOrdersResult {
    valid: [Int]
    invalid: [Int]
  }

  union UpdateWorkOrderResult = WorkOrder | ParentOrderInvoicedNotice

  type WorkOrdersRouteStatus {
    available: [Int]
    updating: [Int]
  }
`;

export const resolvers = {
  WorkOrder: {
    serviceDate: obj => (obj.serviceDate ? format(obj.serviceDate, DB_DATE_FORMAT) : null),
    dailyRoute: obj => obj.$relatedQuery(RELATIONS.DAILY_ROUTE),
    jobSite: obj => (obj.jobSite ? obj.jobSite : obj.$relatedQuery(RELATIONS.JOB_SITE)),
    media: obj => obj.$relatedQuery(RELATIONS.WORK_ORDER_MEDIA),
    comments: obj => obj.$relatedQuery(RELATIONS.COMMENTS),
    notesCount: async (obj, _, ctx) => {
      const res = await trashapiNotesCount(null, { id: obj.id }, ctx);

      return res.count;
    },
  },
  UpdateWorkOrderResult: {
    __resolveType(res) {
      if (res.id) {
        return RESOLVE_TYPE.workOrder;
      }

      if (res.parentOrderId) {
        return RESOLVE_TYPE.parentOrderInvoicedNotice;
      }

      return null;
    },
  },
};
