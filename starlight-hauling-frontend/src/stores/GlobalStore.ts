// Billing module
import { BankDepositStore } from '@root/modules/billing/BankDeposits/store/BankDepositStore';
import { BatchStatementStore } from '@root/modules/billing/BatchStatements/store/BatchStatementStore';
import { CreditCardStore } from '@root/modules/billing/CreditCards/store/CreditCardStore';
import { FinanceChargeStore } from '@root/modules/billing/FinanceCharges/store/FinanceChargeStore';
import { InvoiceStore } from '@root/modules/billing/Invoices/store/InvoiceStore';
import { PaymentStore } from '@root/modules/billing/Payments/store/PaymentStore';
import { PayoutStore } from '@root/modules/billing/Payouts/store/PayoutStore';
import { SettlementStore } from '@root/modules/billing/Settlements/store/SettlementStore';
import { StatementStore } from '@root/modules/billing/Statements/store/StatementStore';
// Pricing module
import { CustomRateStoreNew } from '@root/modules/pricing/CustomRate/store/CustomRateStore';
import { GeneralRateStoreNew } from '@root/modules/pricing/GeneralRate/store/GeneralRateStore';
import { PriceGroupStoreNew } from '@root/modules/pricing/PriceGroup/store/PriceGroupStore';

import { I18nStore } from '../i18n/I18nStore';

import { BillableServiceStore } from './billableService/BillableServiceStore';
import { BrokerStore } from './broker/BrokerStore';
import { BusinessLineStore } from './businessLine/BusinessLineStore';
import { BusinessUnitStore } from './businessUnit/BusinessUnitStore';
import { ChangeReasonStore } from './changeReason/ChangeReasonStore';
import { ChatStore } from './chat/ChatStore';
import { CommonStore } from './common/CommonStore';
import { ContactStore } from './contact/ContactStore';
import { CustomerStore } from './customer/CustomerStore';
import { CustomerAttachmentStore } from './customerAttachment/CustomerAttachmentStore';
import { CustomerCommentStore } from './customerComment/CustomerCommentStore';
import { CustomerGroupStore } from './customerGroup/CustomerGroupStore';
import { DailyRouteStore } from './dailyRoute/DailyRouteStore';
import { DisposalSiteStore } from './disposalSite/DisposalSiteStore';
import { DomainStore } from './domain/DomainStore';
import { QbAccountsStore } from './qbAccounts/QbAccountsStore';
import { QbBillableItemsStore } from './qbBillableItems/QbBillableItemsStore';
import { QbIntegrationSettingsStore } from './qbIntegrationSettings/QbIntegrationSettingsStore';
import { QbIntegrationLogStore } from './qbIntegrationLog/QbIntegrationLogStore';
import { DriverStore } from './driver/DriverStore';
import { EquipmentItemStore } from './equipmentItem/EquipmentItemStore';
import { ExagoStore } from './exago/ExagoStore';
import { GlobalRateStore } from './globalRate/GlobalRateStore';
import { InventoryStore } from './inventory/InventoryStore';
import { JobSiteStore } from './jobSite/JobSiteStore';
import { LandfillOperationStore } from './landfillOperation/LandfillOperationStore';
import { LineItemStore } from './lineItem/LineItemStore';
import { LobbyStore } from './lobby/LobbyStore';
import { MasterRouteStore } from './masterRoute/MasterRouteStore';
import { MaterialStore } from './material/MaterialStore';
import { MaterialProfileStore } from './materialProfile/MaterialProfileStore';
import { MessageStore } from './message/MessageStore';
import { OrderStore } from './order/OrderStore';
import { OrderRequestStore } from './orderRequest/OrderRequestStore';
import { PermitStore } from './permit/PermitStore';
import { PriceGroupStore } from './priceGroup/PriceGroupStore';
import { ProjectStore } from './project/ProjectStore';
import { PromoStore } from './promo/PromoStore';
import { PurchaseOrderStore } from './purchaseOrder/PurchaseOrderStore';
import { RecurrentOrderStore } from './recurrentOrder/RecurrentOrderStore';
import { ReminderStore } from './reminder/ReminderStore';
import { ReportStore } from './report/ReportStore';
import { ResourceStore } from './resource/ResourceStore';
import { RoleStore } from './role/RoleStore';
import { ServiceAreaStore } from './serviceArea/ServiceAreaStore';
import { SubscriptionStore } from './subscription/SubscriptionStore';
import { SubscriptionAttachmentStore } from './subscriptionAttachment/SubscriptionAttachmentStore';
import { SubscriptionDraftStore } from './subscriptionDraft/SubscriptionDraftStore';
import { SubscriptionOrderStore } from './subscriptionOrder/SubscriptionOrderStore';
import { SubscriptionWorkOrderStore } from './subscriptionWorkOrder/SubscriptionWorkOrderStore';
import { SubscriptionWorkOrderAttachmentStore } from './subscriptionWorkOrderAttachment/SubscriptionWorkOrderAttachmentStore';
import { SurchargeStore } from './surcharge/SurchargeStore';
import { SystemConfigurationStore } from './systemConfiguration/SystemConfigurationStore';
import { TaxDistrictStore } from './taxDistrict/TaxDistrictStore';
import { ThirdPartyHaulerStore } from './thirdPartyHauler/ThirdPartyHaulerStore';
import { ThresholdStore } from './threshold/ThresholdStore';
import { TruckStore } from './truck/TruckStore';
import { TruckAndDriverCostStore } from './truckAndDriverCosts/TruckAndDriverCostsStore';
import { TruckTypeStore } from './truckType/TruckTypeStore';
import { UserStore } from './user/UserStore';

// All stores in the list should be sorted alphabetical

class GlobalStore {
  // Special stores that do not extend BaseStore
  exagoStore = new ExagoStore();

  i18nStore = new I18nStore();

  systemConfigurationStore = new SystemConfigurationStore();

  // Billing module
  batchStatementStore = new BatchStatementStore(this);

  bankDepositStore = new BankDepositStore(this);

  creditCardStore = new CreditCardStore(this);

  financeChargeStore = new FinanceChargeStore(this);

  globalRateStore = new GlobalRateStore(this);

  invoiceStore = new InvoiceStore(this);

  paymentStore = new PaymentStore(this);

  payoutStore = new PayoutStore(this);

  settlementStore = new SettlementStore(this);

  statementStore = new StatementStore(this);

  // Pricing module
  customRateStoreNew = new CustomRateStoreNew(this);

  priceGroupStoreNew = new PriceGroupStoreNew(this);

  generalRateStoreNew = new GeneralRateStoreNew(this);

  billableServiceStore = new BillableServiceStore(this);

  brokerStore = new BrokerStore(this);

  businessLineStore = new BusinessLineStore(this);

  businessUnitStore = new BusinessUnitStore(this);

  changeReasonStore = new ChangeReasonStore(this);

  chatStore = new ChatStore(this);

  commonStore = new CommonStore(this);

  contactStore = new ContactStore(this);

  customerAttachmentStore = new CustomerAttachmentStore(this);

  customerCommentStore = new CustomerCommentStore(this);

  customerGroupStore = new CustomerGroupStore(this);

  customerStore = new CustomerStore(this);

  dailyRouteStore = new DailyRouteStore(this);

  disposalSiteStore = new DisposalSiteStore(this);

  domainStore = new DomainStore(this);

  qbAccountsStore = new QbAccountsStore(this);

  qbBillableItemsStore = new QbBillableItemsStore(this);

  qbIntegrationSettingsStore = new QbIntegrationSettingsStore(this);

  qbIntegrationLogStore = new QbIntegrationLogStore(this);

  driverStore = new DriverStore(this);

  equipmentItemStore = new EquipmentItemStore(this);

  inventoryStore = new InventoryStore(this);

  jobSiteStore = new JobSiteStore(this);

  landfillOperationStore = new LandfillOperationStore(this);

  lineItemStore = new LineItemStore(this);

  lobbyStore = new LobbyStore();

  masterRouteStore = new MasterRouteStore(this);

  materialProfileStore = new MaterialProfileStore(this);

  materialStore = new MaterialStore(this);

  messageStore = new MessageStore(this);

  orderRequestStore = new OrderRequestStore(this);

  orderStore = new OrderStore(this);

  permitStore = new PermitStore(this);

  priceGroupStore = new PriceGroupStore(this);

  projectStore = new ProjectStore(this);

  promoStore = new PromoStore(this);

  purchaseOrderStore = new PurchaseOrderStore(this);

  recurrentOrderStore = new RecurrentOrderStore(this);

  reminderStore = new ReminderStore(this);

  reportStore = new ReportStore(this);

  resourceStore = new ResourceStore(this);

  roleStore = new RoleStore(this);

  serviceAreaStore = new ServiceAreaStore(this);

  subscriptionAttachmentStore = new SubscriptionAttachmentStore(this);

  subscriptionDraftStore = new SubscriptionDraftStore(this);

  subscriptionOrderStore = new SubscriptionOrderStore(this);

  subscriptionStore = new SubscriptionStore(this);

  subscriptionWorkOrderStore = new SubscriptionWorkOrderStore(this);

  subscriptionWorkOrderAttachmentStore = new SubscriptionWorkOrderAttachmentStore(this);

  surchargeStore = new SurchargeStore(this);

  taxDistrictStore = new TaxDistrictStore(this);

  thirdPartyHaulerStore = new ThirdPartyHaulerStore(this);

  thresholdStore = new ThresholdStore(this);

  truckAndDriverCostStore = new TruckAndDriverCostStore(this);

  truckStore = new TruckStore(this);

  truckTypeStore = new TruckTypeStore(this);

  userStore = new UserStore(this);
}

export default GlobalStore;
