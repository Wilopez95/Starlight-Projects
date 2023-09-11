export enum Routes {
  Request = 'request',
  Orders = 'orders',
  Order = 'order',
  Login = 'login',
  ResetPassword = 'reset-pass',
  Configuration = 'configuration',
  Customers = 'customers',
  PriceGroups = 'price-groups',
  GeneralRackRates = 'general-rack-rates',
  Customer = 'customer',
  Create = 'create',
  My = 'my',
  Invoices = 'invoices',
  Settlements = 'settlements',
  BusinessUnit = 'business-unit',
  BusinessUnits = 'business-units',
  BusinessLines = 'business-lines',
  Lobby = 'lobby',
  JobSites = 'job-sites',
  Payments = 'payments',
  Payouts = 'payouts',
  Profile = 'profile',
  Details = 'details',
  Media = 'media',
  ServiceAreas = 'service-areas',
  Contacts = 'contacts',
  CreditCards = 'credit-cards',
  Rates = 'rates',
  FinancialHistory = 'financial-history',
  PaymentsAndStatement = 'payments-and-statements',
  PaymentsAndPayouts = 'payments-and-payouts',
  Statements = 'statements',
  OpenOrders = 'open-orders',
  InvoicedOrders = 'invoiced-orders',
  Subscriptions = 'subscriptions',
  Subscription = 'subscription',
  DeferredPayments = 'deferred-payments',
  OrdersAndSubscriptions = 'orders-subscriptions',
  InvoicesAndFinanceCharges = 'invoices-and-finance-charges',
  FinanceCharges = 'finance-charges',
  SubscriptionOrder = 'order',
  SubscriptionNonService = 'nonservice',
  Reports = 'reports',
  Operational = 'operational',
  Sales = 'sales',
  Accounting = 'accounting',
  CustomReports = 'custom-reports',
  EditReport = 'edit-report',
  BankDeposits = 'bank-deposits',
  OrderRequests = 'order-requests',
  OrderRequest = 'order-request',
}

export enum OrderStatusRoutes {
  InProgress = 'inProgress', //TODO: rewrite to "in-progress"
  Completed = 'completed',
  Approved = 'approved',
  Canceled = 'canceled',
  Finalized = 'finalized',
  Invoiced = 'invoiced',
}

export enum SubscriptionTabRoutes {
  Draft = 'draft',
  Active = 'active',
  OnHold = 'on-hold',
  Closed = 'closed',
}

export const Params = {
  Id: ':id',
  Edit: 'edit',
  Path: ':path',
  SubPath: ':subPath',
  BusinessUnit: ':businessUnit',
  BusinessLine: ':businessLine',
  CustomerId: ':customerId',
  CustomerGroupId: ':customerGroupId',
  JobSiteId: ':jobSiteId',
  PaymentId: ':paymentId',
  SubscriptionId: ':subscriptionId',
  OrderId: ':orderId',
  SubscriptionOrderId: ':subscriptionOrderId',
  OrderRequestId: ':orderRequestId',
};

const BusinessUnitPath = `/${Routes.BusinessUnits}/${Params.BusinessUnit}`;
const CustomerPath = `${BusinessUnitPath}/${Routes.Customer}/${Params.CustomerId}`;

const CustomerSubscriptions = `${CustomerPath}/${Routes.Subscriptions}/${Params.SubPath}`;
const CustomerSubscriptionNavigationPath = `${CustomerSubscriptions}/${Params.SubscriptionId}`;

export const Paths = {
  Lobby: `/${Routes.Lobby}`,
  Login: `/${Routes.Login}`,
  BusinessUnit: BusinessUnitPath,
  Configuration: `/${Routes.Configuration}`,

  JobSites: `${BusinessUnitPath}/${Routes.JobSites}`,

  Invoices: `${BusinessUnitPath}/${Routes.InvoicesAndFinanceCharges}/${Params.SubPath}?/${Params.Id}?`,

  Reports: `${BusinessUnitPath}/${Routes.Reports}/${Params.SubPath}`,
  EditReport: `${BusinessUnitPath}/${Routes.Reports}/${Routes.EditReport}/${Params.SubPath}`,

  BankDeposits: `${BusinessUnitPath}/${Routes.BankDeposits}/${Params.Id}?`,
  Settlements: `${BusinessUnitPath}/${Routes.Settlements}`,
  DeferredPayments: `${BusinessUnitPath}/${Routes.DeferredPayments}/${Params.Id}?`,
  PaymentsAndPayouts: `${BusinessUnitPath}/${Routes.PaymentsAndPayouts}/${Params.SubPath}?/${Params.Id}?`,
  PriceGroups: `${BusinessUnitPath}/${Routes.Configuration}/${Params.BusinessLine}/${Routes.PriceGroups}`,

  Dispatch: '/dispatch',

  // Request
  Request: `${BusinessUnitPath}/${Routes.Request}`,

  // Order
  Order: {
    Create: `${BusinessUnitPath}/${Routes.Request}/${Routes.Order}/${Routes.Create}`,
    Edit: `${BusinessUnitPath}/${Routes.Request}/${Routes.Order}/${Params.Edit}/${Params.OrderId}`,
  },
  OrderRequest: {
    Edit: `${BusinessUnitPath}/${Routes.Request}/${Routes.OrderRequest}/${Params.Edit}/${Params.OrderRequestId}`,
  },
  OrderRequests: `${BusinessUnitPath}/${Routes.OrderRequests}`,
  MyOrders: `${BusinessUnitPath}/${Routes.Orders}/${Routes.My}/${Params.SubPath}`,
  Orders: `${BusinessUnitPath}/${Routes.Orders}/${Params.SubPath}`,

  // Subscription
  Subscription: {
    Create: `${BusinessUnitPath}/${Routes.Request}/${Routes.Subscription}/${Routes.Create}`,
    Edit: `${BusinessUnitPath}/${Routes.Request}/${Routes.Subscription}/${Params.Edit}/${Params.SubscriptionId}`,
    Order: {
      Create: `${BusinessUnitPath}/${Routes.Request}/${Routes.Subscription}/${Params.SubscriptionId}/${Routes.SubscriptionOrder}/${Routes.Create}`,
    },
    NonService: {
      Create: `${BusinessUnitPath}/${Routes.Request}/${Routes.Subscription}/${Params.SubscriptionId}/${Routes.SubscriptionNonService}/${Routes.Create}`,
    },
  },
  Subscriptions: `${BusinessUnitPath}/${Routes.Subscriptions}/${Params.SubPath}`,
  MySubscriptions: `${BusinessUnitPath}/${Routes.Subscriptions}/${Routes.My}/${Params.SubPath}`,

  // Customer
  Customer: CustomerPath,
  Customers: `${BusinessUnitPath}/${Routes.Customers}/${Params.CustomerGroupId}?`,
  CustomerProfile: `${CustomerPath}/${Routes.Profile}`,

  CustomerSubscriptions,
  CustomerSubscriptionNavigationPath,

  CustomerSubscriptionDetails: `${CustomerSubscriptionNavigationPath}/${Routes.Details}`,
  CustomerSubscriptionMedia: `${CustomerSubscriptionNavigationPath}/${Routes.Media}`,
  CustomerSubscriptionOrders: `${CustomerSubscriptionNavigationPath}/${Routes.Orders}/${Params.SubscriptionOrderId}?`,
  CustomerSubscriptionOrdersActions: {
    Details: `${CustomerSubscriptionNavigationPath}/${Routes.Orders}/${Params.SubscriptionOrderId}/${Routes.Details}`,
    Edit: `${CustomerSubscriptionNavigationPath}/${Routes.Orders}/${Params.SubscriptionOrderId}/${Routes.Details}`,
  },
  CustomerSubscriptionJobSites: `${CustomerSubscriptionNavigationPath}/${Routes.JobSites}`,
  CustomerSubscriptionInvoices: `${CustomerSubscriptionNavigationPath}/${Routes.Invoices}`,

  CustomerContacts: `${CustomerPath}/${Routes.Contacts}`,
  CustomerCreditCards: `${CustomerPath}/${Routes.CreditCards}`,
  CustomerInvoices: `${CustomerPath}/${Routes.Invoices}/${Params.Id}?`,
  CustomerRates: `${CustomerPath}/${Routes.Rates}`,
  CustomerFinancialHistory: `${CustomerPath}/${Routes.FinancialHistory}`,
  CustomerPaymentsAndStatements: `${CustomerPath}/${Routes.PaymentsAndStatement}/${Params.SubPath}?/${Params.Id}?`,

  CustomerJobSites: `${CustomerPath}/${Routes.JobSites}/${Params.JobSiteId}?/${Params.SubPath}?`,
  CustomerJobSiteOpenOrders: `${CustomerPath}/${Routes.JobSites}/${Params.JobSiteId}/${Routes.OpenOrders}/${Params.Id}?`,
  CustomerJobSiteInvoicedOrders: `${CustomerPath}/${Routes.JobSites}/${Params.JobSiteId}/${Routes.InvoicedOrders}/${Params.Id}?`,
  CustomerJobSiteContacts: `${CustomerPath}/${Routes.JobSites}/${Params.JobSiteId}/${Routes.Contacts}/${Params.Id}?`,
  CustomerJobSiteCreditCards: `${CustomerPath}/${Routes.JobSites}/${Params.JobSiteId}/${Routes.CreditCards}/${Params.Id}?`,
  CustomerJobSiteInvoices: `${CustomerPath}/${Routes.JobSites}/${Params.JobSiteId}/${Routes.Invoices}`,
  CustomerJobSiteRates: `${CustomerPath}/${Routes.JobSites}/${Params.JobSiteId}/${Routes.Rates}/${Params.Id}?`,

  BusinessUnitsConfig: `/${Routes.Configuration}/${Routes.BusinessUnits}`,
  BusinessUnitConfig: `/${Routes.Configuration}/${Routes.BusinessUnits}/${Params.Id}`,
  BusinessLines: `/${Routes.Configuration}/${Routes.BusinessLines}`,
  BusinessLine: `/${Routes.Configuration}/${Routes.BusinessLines}/${Params.Id}`,
};

export const MainPath = Paths.Dispatch;
