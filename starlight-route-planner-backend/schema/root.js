import gql from 'graphql-tag';

import { attachToFields, isAuthenticated } from '../utils/graphqlHelpers.js';
import mutations from './mutation/index.js';
import query from './query/index.js';

export const typeDefs = gql`
  type Query {
    haulingServiceItems(
      businessUnitId: Int!
      filters: HaulingServiceItemFilters
    ): [HaulingServiceItem]
    haulingBusinessLines: [HaulingBusinessLine]
    haulingDisposalSites(onlyLandfills: Boolean): [HaulingDisposalSite]
    haulingEquipmentItems(businessLineId: Int!): [HaulingEquipmentItem]
    haulingMaterials(input: HaulingMaterialFilters): [HaulingMaterial]
    haulingServiceAreas(businessUnitId: Int!, businessLineIds: [Int!]!): [HaulingServiceArea]
    haulingServiceAreasByIds(ids: [Int!]!): [HaulingServiceArea]
    haulingSubscriptionOrder(id: Int!): HaulingSubscriptionOrder
    haulingIndependentOrder(id: Int!): HaulingIndependentOrder
    hauling3rdPartyHaulers: [Hauling3rdPartyHauler]
    haulingTruckTypes: [HaulingTruckType]
    haulingTrucks(
      businessUnitId: Int!
      businessLineTypes: [BUSINESS_LINE_ROUTE_TYPE]
    ): [HaulingTruck]
    haulingDrivers(businessUnitId: Int!, truckId: Int): [HaulingDriver]
    haulingTruck(id: Int!): HaulingTruck
    haulingDriver(id: Int!): HaulingDriver

    dailyRouteReport(dailyRouteId: Int!): DailyRouteReport

    masterRoute(id: Int!): MasterRoute
      @authorized(permissions: ["routePlanner:master-routes:full-access"])
    masterRoutes(businessUnitId: Int!, input: MasterRouteFilters!): [MasterRoute]!
      @authorized(permissions: ["routePlanner:master-routes:full-access"])
    updatingMasterRoutesList(businessUnitId: Int!): [UpdatingMasterRouteInfo!]
      @authorized(permissions: ["routePlanner:master-routes:full-access"])
    masterRoutesCount(businessUnitId: Int!): MasterRouteCount!
      @authorized(permissions: ["routePlanner:master-routes:full-access"])
    availableMasterRouteColor: MasterRouteColor!
      @authorized(permissions: ["routePlanner:master-routes:full-access"])
    masterRouteGrid(businessUnitId: Int!, filters: MasterRouteFilters!): [MasterRouteGrid]
      @authorized(permissions: ["routePlanner:master-routes:full-access"])

    workOrder(id: ID!): WorkOrder
      @authorized(permissions: ["routePlanner:work-orders-list:full-access"])
    workOrders(businessUnitId: Int!, input: WorkOrderFilters!, searchInput: String): [WorkOrder]
      @authorized(permissions: ["routePlanner:work-orders-list:full-access"])
    workOrdersDailyRoute(businessUnitId: Int!, input: WorkOrderDailyRouteFilters!): [WorkOrder]
      @authorized(permissions: ["routePlanner:daily-routes:full-access"])
    workOrderHistory(id: Int!): [WorkOrderHistoryEntry]
      @authorized(permissions: ["routePlanner:work-orders-list:full-access"])

    availableDailyRouteColor: DailyRouteColor!
      @authorized(permissions: ["routePlanner:daily-routes:full-access"])
    dailyRoute(id: Int!): DailyRoute
      @authorized(permissions: ["routePlanner:daily-routes:full-access"])
    dailyRoutes(businessUnitId: Int!, input: DailyRouteFilters!): [DailyRoute]!
      @authorized(permissions: ["routePlanner:daily-routes:full-access"])
    dailyRoutesCount(businessUnitId: Int!, serviceDate: String!): DailyRouteCount!
      @authorized(permissions: ["routePlanner:daily-routes:full-access"])
    dailyRouteHistory(id: Int!): [DailyRouteHistoryEntry]
      @authorized(permissions: ["routePlanner:daily-routes:full-access"])

    dailyRoutesDashboard(
      businessUnitId: Int!
      input: DailyRouteForDashboardFilters!
      searchInput: String
    ): [DailyRoute]! @authorized(permissions: ["routePlanner:dashboard:full-access"])

    serviceItemsAssignmentInfo: [ServiceItemsAssignmentInfo] @authorized
    checkServiceItemsRouteStatus(ids: [Int!]!): ServiceItemsRouteStatus @authorized
    checkWorkOrdersRouteStatus(ids: [Int!]!): WorkOrdersRouteStatus @authorized

    weightTickets(dailyRouteId: Int!): [WeightTicket]!
    trashapiDailyRoutes(serviceDate: String!, driverId: Int!): [DailyRoute]!
    trashapiNotes(id: Int!): [TrashapiNote]!
    trashapiNotesCount(id: Int!): TrashapiNotesCount
  }

  type Mutation {
    createMasterRoute(input: CreateMasterRouteInput!): MasterRoute!
      @authorized(permissions: ["routePlanner:master-routes:full-access"])
    updateMasterRoute(input: UpdateMasterRouteInput!): MasterRoute!
      @authorized(permissions: ["routePlanner:master-routes:full-access"])
    publishMasterRoute(id: Int!, publishDate: String!): MasterRoute!
      @authorized(permissions: ["routePlanner:master-routes:full-access"])
    unpublishMasterRoute(id: Int!, force: Boolean): UnpublishMasterRouteResult!
      @authorized(permissions: ["routePlanner:master-routes:full-access"])
    finishUpdateMasterRoute(id: Int!): Boolean
      @authorized(permissions: ["routePlanner:master-routes:full-access"])
    enableMasterRouteEditMode(id: Int!): EnableMasterRouteEditModeResult!
      @authorized(permissions: ["routePlanner:master-routes:full-access"])
    disableMasterRouteEditMode(id: Int!): MasterRoute!
      @authorized(permissions: ["routePlanner:master-routes:full-access"])
    updateMasterRouteGrid(input: UpdateMasterRouteGridInput!): UpdateMasterRouteGrid!
      @authorized(permissions: ["routePlanner:master-routes:full-access"])

    workOrdersBulkStatusChange(input: BulkStatusChangeWorkOrderInput!): BulkActionWorkOrdersResult
      @authorized(permissions: ["routePlanner:work-orders-list:full-access"])
    workOrdersBulkReschedule(input: BulkRescheduleWorkOrderInput!): BulkActionWorkOrdersResult
      @authorized(permissions: ["routePlanner:work-orders-list:full-access"])

    createDailyRoute(businessUnitId: Int!, input: CreateDailyRouteInput!): DailyRoute!
      @authorized(permissions: ["routePlanner:daily-routes:full-access"])
    updateDailyRoute(input: UpdateDailyRouteInput!): DailyRoute!
      @authorized(permissions: ["routePlanner:daily-routes:full-access"])
    enableDailyRouteEditMode(id: Int!): EnableDailyRouteEditModeResult!
      @authorized(permissions: ["routePlanner:daily-routes:full-access"])
    disableDailyRouteEditMode(id: Int!): DailyRoute!
      @authorized(permissions: ["routePlanner:daily-routes:full-access"])

    updateDailyRouteQuickViewInfo(id: Int!, input: UpdateDailyRouteQuickViewInput!): DailyRoute!
      @authorized(permissions: ["routePlanner:dashboard:full-access"])

    createComment(input: CreateCommentInput!): Comment!
      @authorized(permissions: ["routePlanner:work-orders-list:full-access"])

    updateWorkOrder(input: UpdateWorkOrderInput!): UpdateWorkOrderResult!
      @authorized(permissions: ["routePlanner:work-orders-list:full-access"])
    uploadWorkOrderMedia(id: Int!, input: Upload!): [WorkOrderMedia!]!
      @authorized(permissions: ["routePlanner:work-orders-list:full-access"])
    deleteWorkOrderMedia(ids: [ID!]!, workOrderId: Int!): [ID]
      @authorized(permissions: ["routePlanner:work-orders-list:full-access"])

    createWeightTicket(input: CreateWeightTicketInput!, media: Upload): WeightTicket!
      @authorized(permissions: ["routePlanner:dashboard:full-access"])
    updateWeightTicket(id: Int!, input: UpdateWeightTicketInput!, media: Upload): WeightTicket!
      @authorized(permissions: ["routePlanner:dashboard:full-access"])
    deleteWeightTicket(id: Int!): Int!
      @authorized(permissions: ["routePlanner:dashboard:full-access"])

    syncJobSitesFromHauling: Response!

    trashapiUpdateDailyRoute(id: Int!, input: UpdateDailyRouteTrashapi!): DailyRoute!
    trashapiUpdateWorkOrder(id: Int!, input: UpdateWorkOrderTrashapi!): WorkOrder!
    trashapiCreateWeightTicket(input: CreateWeightTicketInput!, url: String!): WeightTicket!
    trashapiUpdateWeightTicket(
      id: Int!
      input: UpdateWeightTicketInput!
      url: String
    ): WeightTicket!
  }
`;

const baseResolvers = {
  Query: query,
  Mutation: mutations,
};

export const resolvers = attachToFields({
  resolvers: isAuthenticated,
  resolverMap: baseResolvers,
  skipFields: [
    'trashapiDailyRoutes',
    'trashapiUpdateDailyRoute',
    'trashapiUpdateWorkOrder',
    'trashapiNotesCount',
  ],
});
