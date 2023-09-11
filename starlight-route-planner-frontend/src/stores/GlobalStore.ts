import { I18nStore } from '../i18n/I18nStore';

import { HaulerStore } from './3pHauler/3pHaulerStore';
import { BusinessLineStore } from './businessLine/BusinessLineStore';
import { BusinessUnitStore } from './businessUnit/BusinessUnitStore';
import { CommonStore } from './common/CommonStore';
import { CustomerStore } from './customer/CustomerStore';
import { CustomerGroupStore } from './customerGroup/CustomerGroupStore';
import { DailyRouteHistoryStore } from './dailyRouteHistory/DailyRouteHistoryStore';
import { DailyRoutesStore } from './dailyRoutes/DailyRoutesStore';
import { DashboardStore } from './dashboard/DashboardStore';
import { EquipmentItemStore } from './equipmentItem/EquipmentItemStore';
import { HaulingDriverStore } from './haulingDrivers/HaulingDriverStore';
import { HaulingServiceItemStore } from './haulingServiceItem/HaulingServiceItemStore';
import { HaulingTruckStore } from './haulingTrucks/HaulingTruckStore';
import { HaulingTruckTypeStore } from './haulingTruckTypes/HaulingTruckTypeStore';
import { IndependentOrderStore } from './independentOrder/IndependentOrderStore';
import { JobSiteStore } from './jobSite/JobSiteStore';
import { LandfillOperationStore } from './landfillOperation/LandfillOperationStore';
import { LobbyStore } from './lobby/LobbyStore';
import { MasterRoutesStore } from './masterRoutes/MasterRoutesStore';
import { MaterialStore } from './material/MaterialStore';
import { OrderStore } from './order/OrderStore';
import { OrderRequestStore } from './orderRequest/OrderRequestStore';
import { ReminderStore } from './reminder/ReminderStore';
import { ServiceAreaStore } from './serviceArea/ServiceAreaStore';
import { SubscriptionStore } from './subscription/SubscriptionStore';
import { SubscriptionDraftStore } from './subscriptionDraft/SubscriptionDraftStore';
import { SubscriptionOrderStore } from './subscriptionOrder/SubscriptionOrderStore';
import { WaypointStore } from './waypoint/WayPointStore';
import { WeightTicketStore } from './WeightTicketStore/WeightTicketStore';
import { WorkOrderStore } from './workOrder/WorkOrderStore';
import { WorkOrderCommentsStore } from './workOrderComments/WorkOrderCommentsStore';
import { WorkOrderHistoryStore } from './WorkOrderHistory/WorkOrderHistoryStore';
import { WorkOrderMapItemStore } from './workOrderMapItem/WorkOrderMapItemStore';

class GlobalStore {
  i18nStore = new I18nStore();

  lobbyStore = new LobbyStore();

  // BaseStore used for storing domain entities
  orderStore = new OrderStore(this);

  commonStore = new CommonStore(this);

  customerStore = new CustomerStore(this);

  businessUnitStore = new BusinessUnitStore(this);

  businessLineStore = new BusinessLineStore(this);

  dashboardStore = new DashboardStore(this);

  subscriptionStore = new SubscriptionStore(this);

  jobSiteStore = new JobSiteStore(this);

  orderRequestStore = new OrderRequestStore(this);

  customerGroupStore = new CustomerGroupStore(this);

  landfillOperationStore = new LandfillOperationStore(this);

  subscriptionDraftStore = new SubscriptionDraftStore(this);

  subscriptionOrderStore = new SubscriptionOrderStore(this);

  independentOrderStore = new IndependentOrderStore(this);

  haulingServiceItemStore = new HaulingServiceItemStore(this);

  masterRoutesStore = new MasterRoutesStore(this);

  waypointsStore = new WaypointStore(this);

  reminderStore = new ReminderStore(this);

  dailyRoutesStore = new DailyRoutesStore(this);

  dailyRouteHistoryStore = new DailyRouteHistoryStore(this);

  serviceAreaStore = new ServiceAreaStore(this);

  materialStore = new MaterialStore(this);

  equipmentItemStore = new EquipmentItemStore(this);

  workOrdersStore = new WorkOrderStore(this);

  workOrderCommentsStore = new WorkOrderCommentsStore(this);

  workOrderDailyRouteStore = new WorkOrderMapItemStore(this);

  workOrderHistory = new WorkOrderHistoryStore(this);

  weightTicketStore = new WeightTicketStore(this);

  haulerStore = new HaulerStore(this);

  haulingDriversStore = new HaulingDriverStore(this);

  haulingTrucksStore = new HaulingTruckStore(this);

  haulingTruckTypesStore = new HaulingTruckTypeStore(this);
}

export default GlobalStore;
