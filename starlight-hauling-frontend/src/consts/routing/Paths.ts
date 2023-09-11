import { Params } from './Params';
import { ParamsValidation } from './ParamsValidation';
import { BusinessUnitPath, RouteModules } from './RouteModules';
import { Routes } from './Routes';

export const Paths = {
  Lobby: `/${Routes.Lobby}`,
  Login: `/${Routes.Login}`,
  LobbyFinishLogin: `/${Routes.Lobby}/${Routes.FinishLogin}`,
  LobbyLogin: `/${Routes.Lobby}/${Routes.Login}`,
  FinishLogin: `/${Routes.FinishLogin}`,

  BusinessUnitLogin: {
    FinishLogin: `/${Params.tenantName}/${Routes.BusinessUnits}/${Params.businessUnit}/${Routes.FinishLogin}`,
    Login: `/${Params.tenantName}/${Routes.BusinessUnits}/${Params.businessUnit}/${Routes.Login}`,
    LoginRedirect: `/${Params.tenantName}/${Routes.BusinessUnits}/${Params.businessUnit}`,
    UnauthenticatedRedirect: `/${Routes.BusinessUnits}/${Params.businessUnit}`,
  },

  Chats: `${BusinessUnitPath}/${Routes.Chats}`,

  OrderModule: {
    OrderRequests: `${RouteModules.Orders}/${Routes.Requests}`,
    MyOrders: `${RouteModules.Orders}/${Routes.My}/${Params.subPath}${ParamsValidation.OrderStatus}`,
    Orders: `${RouteModules.Orders}/${Params.subPath}${ParamsValidation.OrderStatus}/${Params.orderId}?`,
  },

  SubscriptionModule: {
    Subscriptions: `${RouteModules.Subscriptions}/${Params.tab}${ParamsValidation.SubscriptionStatus}/${Params.subscriptionId}?`,
    MySubscriptions: `${RouteModules.Subscriptions}/${Routes.My}/${Params.tab}${ParamsValidation.SubscriptionStatus}`,
    SubscriptionOrders: `${RouteModules.Subscriptions}/${Routes.Orders}/${Params.tab}${ParamsValidation.SubscriptionOrderStatus}`,
  },

  CustomersModule: {
    Customers: `${RouteModules.Customers}/${Params.customerGroupId}?`,
  },

  JobSitesModule: {
    JobSites: `${RouteModules.JobSites}/${Params.id}?`,
  },

  LandfillOperationsModule: {
    LandfillOperations: `${RouteModules.LandfillOperations}/${Params.id}?`,
  },

  BillingModule: {
    Invoices: `${RouteModules.Billing}/${Routes.InvoicesAndFinanceCharges}/${Params.subPath}?/${Params.id}?`,
    BankDeposits: `${RouteModules.Billing}/${Routes.BankDeposits}/${Params.id}?`,
    DeferredPayments: `${RouteModules.Billing}/${Routes.DeferredPayments}/${Params.paymentId}?/${Params.id}?`,
    PaymentsAndPayouts: `${RouteModules.Billing}/${Routes.PaymentsAndPayouts}/${Params.subPath}?/${Params.id}?`,
    BatchStatements: `${RouteModules.Billing}/${Routes.BatchStatements}/${Params.id}?`,
    Settlements: `${RouteModules.Billing}/${Routes.Settlements}`,
  },

  ReportsModule: {
    Reports: `${RouteModules.Reports}/${Params.subPath}`,
    View: `${RouteModules.Reports}/${Routes.RunReport}/${Params.subPath}`,
    Edit: `${RouteModules.Reports}/${Routes.EditReport}/${Params.subPath}`,
    Create: `${RouteModules.Reports}/${Routes.CreateReport}/${Params.type}`,
    Delete: `${RouteModules.Reports}/${Routes.DeleteReport}`,
    Duplicate: `${RouteModules.Reports}/${Routes.DuplicateReport}/${Params.subPath}`,
  },

  CustomerModule: {
    Profile: `${RouteModules.Customer}/${Routes.Profile}`,
    OrdersAndSubscriptions: `${RouteModules.Customer}/${Routes.OrdersAndSubscriptions}`,
    Orders: `${RouteModules.Customer}/${Routes.Orders}/${Params.subPath}${ParamsValidation.OrderStatus}/${Params.orderId}?`,
    JobSites: `${RouteModules.Customer}/${Routes.JobSites}/${Params.jobSiteId}?/${Params.subPath}?`,
    Contacts: `${RouteModules.Customer}/${Routes.Contacts}`,
    CreditCards: `${RouteModules.Customer}/${Routes.CreditCards}`,
    Invoices: `${RouteModules.Customer}/${Routes.InvoicesAndFinanceCharges}/${Params.subPath}?/${Params.id}?`,
    PaymentsAndStatements: `${RouteModules.Customer}/${Routes.PaymentsAndStatement}/${Params.subPath}?/${Params.id}?`,
    Attachments: `${RouteModules.Customer}/${Routes.Attachments}`,
    PurchaseOrders: `${RouteModules.Customer}/${Routes.PurchaseOrders}`,
    Trucks: `${RouteModules.Customer}/${Routes.Trucks}`,
  },

  CustomerJobSiteModule: {
    OpenOrders: `${RouteModules.CustomerJobSite}/${Routes.OpenOrders}/${Params.id}?`,
    InvoicedOrders: `${RouteModules.CustomerJobSite}/${Routes.InvoicedOrders}/${Params.id}?`,
    Contacts: `${RouteModules.CustomerJobSite}/${Routes.Contacts}/${Params.id}?`,
    CreditCards: `${RouteModules.CustomerJobSite}/${Routes.CreditCards}/${Params.id}?`,
    Invoices: `${RouteModules.CustomerJobSite}/${Routes.Invoices}`,
    Rates: `${RouteModules.CustomerJobSite}/${Routes.Rates}/${Params.id}?`,
  },

  CustomerSubscriptionModule: {
    Subscriptions: RouteModules.CustomerSubscriptions,
    Subscription: `${RouteModules.CustomerSubscriptions}/${Params.subscriptionId}`,
    Details: `${RouteModules.CustomerSubscriptions}/${Params.subscriptionId}/${Routes.Details}`,
    History: `${RouteModules.CustomerSubscriptions}/${Params.subscriptionId}/${Routes.History}`,
    Media: `${RouteModules.CustomerSubscriptions}/${Params.subscriptionId}/${Routes.Media}`,
    JobSites: `${RouteModules.CustomerSubscriptions}/${Params.subscriptionId}/${Routes.JobSites}`,
    Invoices: `${RouteModules.CustomerSubscriptions}/${Params.subscriptionId}/${Routes.Invoices}`,
    Orders: `${RouteModules.CustomerSubscriptions}/${Params.subscriptionId}/${Routes.Orders}/${Params.subscriptionOrderId}?`,
    OrderDetails: `${RouteModules.CustomerSubscriptions}/${Params.subscriptionId}/${Routes.Orders}/${Params.subscriptionOrderId}/${Routes.Details}`,
    OrderEdit: `${RouteModules.CustomerSubscriptions}/${Params.subscriptionId}/${Routes.Orders}/${Params.subscriptionOrderId}/${Routes.Details}`,
  },
  CustomerRecurrentOrderModule: {
    Orders: RouteModules.CustomerRecurrentOrders,
    MainInformation: `${RouteModules.CustomerRecurrentOrders}/${Params.id}/${Routes.MainInformation}`,
    GeneratedOrders: `${RouteModules.CustomerRecurrentOrders}/${Params.id}/${Routes.GeneratedOrders}`,
  },

  SystemConfigurationModule: {
    Login: `/${Params.tenantName}/${Routes.Configuration}/${Routes.Login}`,
    FinishLogin: `/${Params.tenantName}/${Routes.Configuration}/${Routes.FinishLogin}`,
    LoginRedirect: `/${Params.tenantName}/${Routes.Configuration}`,

    UnauthenticatedRedirect: `${RouteModules.SystemConfiguration}/${Params.businessUnit}`,
    BusinessUnits: `${RouteModules.SystemConfiguration}/${Routes.BusinessUnits}`,
    UserAndRoles: `${RouteModules.SystemConfiguration}/${Routes.UserAndRoles}/${Params.subPath}?`,
    CompanyProfile: `${RouteModules.SystemConfiguration}/${Routes.Company}`,
    BusinessUnit: `${RouteModules.SystemConfiguration}/${Routes.BusinessUnits}/${Params.id}/${Params.businessUnitType}`,
    BusinessLines: `${RouteModules.SystemConfiguration}/${Routes.BusinessLines}`,
    BusinessLine: `${RouteModules.SystemConfiguration}/${Routes.BusinessLines}/${Params.id}`,
    CompanySettings: `${RouteModules.SystemConfiguration}/${Routes.CompanySettings}`,
    //CHANGE THIS JGG
    AccountingSettings: `${RouteModules.SystemConfiguration}/${Routes.IntegrationSettings}/${Params.id}`,
    CustomerGroups: `${RouteModules.SystemConfiguration}/${Routes.CustomerGroups}`,
    Brokers: `${RouteModules.SystemConfiguration}/${Routes.Brokers}`,
    ThirdPartyHaulers: `${RouteModules.SystemConfiguration}/${Routes.ThirdPartyHaulers}`,
    Waypoints: `${RouteModules.SystemConfiguration}/${Routes.Waypoints}`,
    TaxDistricts: `${RouteModules.SystemConfiguration}/${Routes.TaxDistricts}`,
    OperatingCosts: `${RouteModules.SystemConfiguration}/${Routes.OperatingCosts}`,
    DriversAndTrucks: `${RouteModules.SystemConfiguration}/${Routes.DriversAndTrucks}`,
    AuditLog: `${RouteModules.SystemConfiguration}/${Routes.AuditLog}`,
    IntegrationLog: `${RouteModules.SystemConfiguration}/${Routes.IntegrationLog}`,
    ChangeReasons: `${RouteModules.SystemConfiguration}/${Routes.ChangeReasons}`,
  },
  SystemBusinessLinesConfigurationModule: {
    BillableItems: `${RouteModules.SystemConfiguration}/${Routes.BusinessLines}/${Params.id}/${Routes.BillableItems}`,
    Materials: `${RouteModules.SystemConfiguration}/${Routes.BusinessLines}/${Params.id}/${Routes.Materials}`,
    MaterialProfiles: `${RouteModules.SystemConfiguration}/${Routes.BusinessLines}/${Params.id}/${Routes.MaterialProfile}`,
    EquipmentItems: `${RouteModules.SystemConfiguration}/${Routes.BusinessLines}/${Params.id}/${Routes.EquipmentItems}`,
  },
  BusinessUnitConfigurationModule: {
    PriceGroups: `${RouteModules.BusinessUnitConfiguration}/${Routes.PriceGroups}`,
    GeneralRackRates: `${RouteModules.BusinessUnitConfiguration}/${Routes.GeneralRackRates}`,
    Scales: `${RouteModules.BusinessUnitConfiguration}/${Routes.Scales}`,
    OriginsAndDestinations: `${RouteModules.BusinessUnitConfiguration}/${Routes.OriginsAndDestinations}/${Params.subPath}?`,
    //TODO add all pages
  },

  RequestModule: {
    Request: RouteModules.Request,
    Order: {
      Create: `${RouteModules.Request}/${Routes.Order}/${Routes.Create}`,
      Edit: `${RouteModules.Request}/${Routes.Order}/${Routes.Edit}/${Params.orderId}`,
    },
    OrderRequest: {
      Edit: `${BusinessUnitPath}/${Routes.Request}/${Routes.OrderRequest}/${Routes.Edit}/${Params.orderRequestId}`,
    },
    Subscription: {
      Create: `${RouteModules.Request}/${Routes.Subscription}/${Routes.Create}`,
      Edit: `${RouteModules.Request}/${Routes.Subscription}/${Routes.Edit}/${Params.entity}/${Params.subscriptionId}`,
      Clone: `${RouteModules.Request}/${Routes.Subscription}/${Routes.Clone}/${Params.entity}/${Params.subscriptionId}`,
    },
    SubscriptionOrder: {
      Create: `${RouteModules.Request}/${Routes.Subscription}/${Params.subscriptionId}/${Routes.Order}/${Routes.Create}`,
    },
    SubscriptionNonService: {
      Create: `${RouteModules.Request}/${Routes.Subscription}/${Params.subscriptionId}/${Routes.SubscriptionNonService}/${Routes.Create}`,
    },
  },
};
