import { Params } from './Params';
import { ParamsValidation } from './ParamsValidation';
import { Routes } from './Routes';

const BusinessUnitPath = `/${Routes.BusinessUnits}/${Params.businessUnit}`;
const CustomerPath = `${BusinessUnitPath}/${Routes.Customer}/${Params.customerId}`;

export const RouteModules = {
  businessUnit: BusinessUnitPath,

  BusinessUnitConfiguration: `${BusinessUnitPath}/${Routes.Configuration}/${Params.businessLine}?`,

  //TODO remove this trash
  BusinessUnitConfigurationFull: `${BusinessUnitPath}/${Routes.Configuration}/${Params.businessLine}?/${Params.path}?/${Params.subPath}?`,

  Orders: `${BusinessUnitPath}/${Routes.Orders}`,
  Subscriptions: `${BusinessUnitPath}/${Routes.Subscriptions}`,
  Customers: `${BusinessUnitPath}/${Routes.Customers}`,
  JobSites: `${BusinessUnitPath}/${Routes.JobSites}`,
  Reports: `${BusinessUnitPath}/${Routes.Reports}`,
  Billing: `${BusinessUnitPath}/${Routes.Billing}`,
  Request: `${BusinessUnitPath}/${Routes.Request}`,

  GlobalSystemConfiguration: `/${Routes.Configuration}`,

  Dispatch: `${BusinessUnitPath}/${Routes.Dispatch}`,

  MasterRouteGrid: `${BusinessUnitPath}/${Routes.MasterRouteGrid}`,

  Customer: CustomerPath,
  CustomerJobSite: `${CustomerPath}/${Routes.JobSites}/${Params.jobSiteId}`,
  CustomerSubscriptions: `${CustomerPath}/${Routes.OrdersAndSubscriptions}/${Routes.Subscriptions}/${Params.tab}`,
  CustomerRecurrentOrders: `${CustomerPath}/${Routes.OrdersAndSubscriptions}/${Routes.RecurrentOrders}`,
};

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

  OrderModule: {
    OrderRequests: `${RouteModules.Orders}/${Routes.Requests}`,
    MyOrders: `${RouteModules.Orders}/${Routes.My}/${Params.subPath}${ParamsValidation.OrderStatus}`,
    Orders: `${RouteModules.Orders}/${Params.subPath}${ParamsValidation.OrderStatus}`,
  },

  SubscriptionModule: {
    Subscriptions: `${RouteModules.Subscriptions}/${Params.tab}${ParamsValidation.SubscriptionStatus}`,
    MySubscriptions: `${RouteModules.Subscriptions}/${Routes.My}/${Params.tab}${ParamsValidation.SubscriptionStatus}`,
  },

  CustomersModule: {
    Customers: `${RouteModules.Customers}/${Params.customerGroupId}?`,
  },

  JobSitesModule: {
    JobSites: RouteModules.JobSites,
  },

  BillingModule: {
    Invoices: `${RouteModules.Billing}/${Routes.InvoicesAndFinanceCharges}/${Params.subPath}?/${Params.id}?`,
    BankDeposits: `${RouteModules.Billing}/${Routes.BankDeposits}/${Params.id}?`,
    DeferredPayments: `${RouteModules.Billing}/${Routes.DeferredPayments}/${Params.id}?`,
    //AccountsReceivable : TODO
    PaymentsAndPayouts: `${RouteModules.Billing}/${Routes.PaymentsAndPayouts}/${Params.subPath}?/${Params.id}?`,
    BatchStatements: `${RouteModules.Billing}/${Routes.BatchStatements}/${Params.id}?`,
    Settlements: `${RouteModules.Billing}/${Routes.Settlements}`,
  },

  ReportsModule: {
    Reports: `${RouteModules.Reports}/${Params.subPath}`,
    Edit: `${RouteModules.Reports}/${Routes.EditReport}/${Params.subPath}`,
    Create: `${RouteModules.Reports}/${Routes.CreateReport}`,
  },

  DispatchModule: {
    Dashboard: `${RouteModules.Dispatch}/${Routes.Dashboard}`,
    DashboardDetails: `${RouteModules.Dispatch}/${Routes.Dashboard}/${Params.id}`,
    MasterRoutes: `${RouteModules.Dispatch}/${Routes.MasterRoutes}`,
    MasterRoute: `${RouteModules.Dispatch}/${Routes.MasterRoutes}/${Params.id}`,
    DailyRoutes: `${RouteModules.Dispatch}/${Routes.DailyRoutes}`,
    DailyRoute: `${RouteModules.Dispatch}/${Routes.DailyRoutes}/${Params.id}`,
    DriversTracks: `${RouteModules.Dispatch}/${Routes.DriversTrucks}`,
    WorkOrders: `${RouteModules.Dispatch}/${Routes.WorkOrders}`,
    WorkOrder: `${RouteModules.Dispatch}/${Routes.WorkOrders}/${Params.id}`,
  },

  CustomerModule: {
    Profile: `${RouteModules.Customer}/${Routes.Profile}`,
    OrdersAndSubscriptions: `${RouteModules.Customer}/${Routes.OrdersAndSubscriptions}`,
    JobSites: `${RouteModules.Customer}/${Routes.JobSites}/${Params.jobSiteId}?/${Params.subPath}?`,
    Contacts: `${RouteModules.Customer}/${Routes.Contacts}`,
    CreditCards: `${RouteModules.Customer}/${Routes.CreditCards}`,
    Invoices: `${RouteModules.Customer}/${Routes.Invoices}/${Params.id}?`,
    PaymentsAndStatements: `${RouteModules.Customer}/${Routes.PaymentsAndStatement}/${Params.subPath}?/${Params.id}?`,
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
    Subscription: `${RouteModules.CustomerSubscriptions}/${Params.id}`,
    Details: `${RouteModules.CustomerSubscriptions}/${Params.id}/${Routes.Details}`,
    Media: `${RouteModules.CustomerSubscriptions}/${Params.id}/${Routes.Media}`,
    JobSites: `${RouteModules.CustomerSubscriptions}/${Params.id}/${Routes.JobSites}`,
    Invoices: `${RouteModules.CustomerSubscriptions}/${Params.id}/${Routes.Invoices}`,
    Orders: `${RouteModules.CustomerSubscriptions}/${Params.id}/${Routes.Orders}/${Params.subscriptionOrderId}?`,
    OrderDetails: `${RouteModules.CustomerSubscriptions}/${Params.id}/${Routes.Orders}/${Params.subscriptionOrderId}/${Routes.Details}`,
    OrderEdit: `${RouteModules.CustomerSubscriptions}/${Params.id}/${Routes.Orders}/${Params.subscriptionOrderId}/${Routes.Details}`,
  },
  CustomerRecurrentOrderModule: {
    Orders: RouteModules.CustomerRecurrentOrders,
    MainInformation: `${RouteModules.CustomerRecurrentOrders}/${Params.id}/${Routes.MainInformation}`,
    GeneratedOrders: `${RouteModules.CustomerRecurrentOrders}/${Params.id}/${Routes.GeneratedOrders}`,
  },

  GlobalSystemConfigurationModule: {
    Login: `${RouteModules.GlobalSystemConfiguration}/${Routes.Login}`,
    FinishLogin: `${RouteModules.GlobalSystemConfiguration}/${Routes.FinishLogin}`,
    LoginRedirect: `${RouteModules.GlobalSystemConfiguration}/${Params.businessUnit}`,
    BusinessUnits: `${RouteModules.GlobalSystemConfiguration}/${Routes.BusinessUnits}`,
    businessUnit: `${RouteModules.GlobalSystemConfiguration}/${Routes.BusinessUnits}/${Params.id}/${Params.businessUnitType}`,
    BusinessLines: `${RouteModules.GlobalSystemConfiguration}/${Routes.BusinessLines}`,
    businessLine: `${RouteModules.GlobalSystemConfiguration}/${Routes.BusinessLines}/${Params.id}`,

    //TODO add all pages
    //UserAndRoles
  },
  BusinessUnitConfigurationModule: {
    PriceGroups: `${RouteModules.BusinessUnitConfiguration}/${Routes.PriceGroups}`,
    GeneralRackRates: `${RouteModules.BusinessUnitConfiguration}/${Routes.GeneralRackRates}`,
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
    },
    SubscriptionOrder: {
      Create: `${RouteModules.Request}/${Routes.Subscription}/${Params.subscriptionId}/${Routes.Order}/${Routes.Create}`,
    },
    SubscriptionNonService: {
      Create: `${RouteModules.Request}/${Routes.Subscription}/${Params.subscriptionId}/${Routes.SubscriptionNonService}/${Routes.Create}`,
    },
  },
};
