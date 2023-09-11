export const enum Routes {
  Login = 'login',
  Lobby = 'lobby',
  FinishLogin = 'finish-login',
  BusinessUnits = 'business-units',
  Configuration = 'configuration',

  Customers = 'customers',
  Profile = 'profile',
  CreditCards = 'credit-cards',
  Contacts = 'contacts',
  Users = 'users',
  Subscriptions = 'subscriptions',
  Statements = 'statements',
  Invoices = 'invoices',
  Reports = 'reports',
}

export const enum OrderStatusRoutes {
  InProgress = 'inProgress', //TODO: rewrite to "in-progress"
  Completed = 'completed',
  Approved = 'approved',
  Canceled = 'canceled',
  Finalized = 'finalized',
  Invoiced = 'invoiced',
}

export const Params = {
  tenantName: ':tenantName',

  businessLine: ':businessLine',
  businessUnit: ':businessUnit',
  businessUnitType: ':businessUnitType',

  customerGroupId: ':customerGroupId',
  customerId: ':customerId',

  entity: ':entity',
  id: ':id',
  jobSiteId: ':jobSiteId',
  orderId: ':orderId',
  orderRequestId: ':orderRequestId',
  path: ':path',
  paymentId: ':paymentId',
  subPath: ':subPath',
  subscriptionId: ':subscriptionId',
  subscriptionOrderId: ':subscriptionOrderId',
  tab: ':tab',
  type: ':type',
};

export const enum SubscriptionTabRoutes {
  Draft = 'draft',
  Active = 'active',
  OnHold = 'on-hold',
  Closed = 'closed',
}

export const customerPath = `/${Routes.Customers}/${Params.customerId}`;

export const Paths = {
  Lobby: `/${Routes.Lobby}`,
  Login: `/${Routes.Login}`,
  LobbyFinishLogin: `/${Routes.Lobby}/${Routes.FinishLogin}`,
  LobbyLogin: `/${Routes.Lobby}/${Routes.Login}`,
  FinishLogin: `/${Routes.FinishLogin}`,

  CustomerLogin: {
    FinishLogin: `${customerPath}/${Routes.FinishLogin}`,
    Login: `${customerPath}/${Routes.Login}`,
    LoginRedirect: customerPath,
    UnauthenticatedRedirect: customerPath,
  },

  Profile: `${customerPath}/${Routes.Profile}`,
  CustomerContacts: `${customerPath}/${Routes.Contacts}`,
  CustomerCreditCards: `${customerPath}/${Routes.CreditCards}`,
  Subscriptions: `${customerPath}/${Routes.Subscriptions}/${Params.tab}`,
  Users: `${customerPath}/${Routes.Users}`,
  Statements: `${customerPath}/${Routes.Statements}`,
  Reports: `${customerPath}/${Routes.Reports}`,
  Invoices: `${customerPath}/${Routes.Invoices}/${Params.id}?`,
};

export const MainPath = Paths.Profile;
