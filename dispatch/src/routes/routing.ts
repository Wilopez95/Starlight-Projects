/* eslint-disable no-shadow */
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
  Dispatcher = 'dispatcher',
}

export const Params = {
  CustomerId: ':customerId',
  Tab: ':tab',
  Id: ':id',
  businessUnit: ':businessUnit',
  tenantName: ':tenantName',
  businessUnitType: ':businessUnitType',
  canId: ':canId',
  value: ':value',
};

const BusinessUnitPath = `/${Routes.BusinessUnits}/${Params.businessUnit}`;
const GlobalSystemConfiguration = `/${Routes.Configuration}`;

export const Paths = {
  Lobby: `/${Routes.Lobby}`,
  Login: `/${Routes.Login}`,
  LobbyFinishLogin: `/${Routes.Lobby}/${Routes.FinishLogin}`,
  LobbyLogin: `/${Routes.Lobby}/${Routes.Login}`,
  FinishLogin: `/${Routes.FinishLogin}`,
  Configuration: `/${Routes.Configuration}`,

  BusinessUnitLogin: {
    FinishLogin: `/${Params.tenantName}${BusinessUnitPath}/${Routes.FinishLogin}`,
    Login: `/${Params.tenantName}${BusinessUnitPath}/${Routes.Login}`,
    LoginRedirect: `/${Params.tenantName}${BusinessUnitPath}`,
    UnauthenticatedRedirect: `/${Params.tenantName}/${Routes.BusinessUnits}/${Params.businessUnit}`,
  },
  GlobalSystemConfigurationModule: {
    Login: `/${Params.tenantName}/${Routes.Configuration}/${Routes.Login}`,
    FinishLogin: `/${Params.tenantName}/${Routes.Configuration}/${Routes.FinishLogin}`,
    LoginRedirect: `/${Params.tenantName}/${Routes.Configuration}`,
    UnauthenticatedRedirect: `${GlobalSystemConfiguration}/${Params.businessUnit}`,
    BusinessUnits: `${GlobalSystemConfiguration}/${Routes.BusinessUnits}`,
    BusinessUnit: `${GlobalSystemConfiguration}/${Routes.BusinessUnits}/${Params.Id}/${Params.businessUnitType}`,

    //TODO add all pages
    //UserAndRoles
  },
  Dispatcher: `${BusinessUnitPath}/${Routes.Dispatcher}`,
  DispatcherCreate: `${BusinessUnitPath}/${Routes.Dispatcher}/create`,
  InventoryEditItem: `${BusinessUnitPath}/inventory/can/${Params.canId}/edit/actions`,
  InventoryEdit: `${BusinessUnitPath}/inventory/can/${Params.canId}/edit`,
  WorkOrders: `${BusinessUnitPath}/workorders/map`,
  Work: `${BusinessUnitPath}/workorders`,
  WorkOrdersEdit: `${BusinessUnitPath}/workorders/map/edit/${Params.Id}`,
  WorkOrdersEditTable: `${BusinessUnitPath}/workorders/table/edit/${Params.Id}`,
  WorkOrdersTableEdit: `${BusinessUnitPath}/workorders/table/edit/${Params.value}`,
  WorkOrdersTableEditRoute: `${BusinessUnitPath}/workorders/table/route/${Params.Id}`,
  WorkOrdersTableEditHistory: `${BusinessUnitPath}/workorders/table/history/${Params.Id}`,
  WorkOrdersMapEditRoute: `${BusinessUnitPath}/workorders/map/route/${Params.Id}`,
  WorkOrdersMapEditHistory: `${BusinessUnitPath}/workorders/map/history/${Params.Id}`,
  WorkOrdersTable: `${BusinessUnitPath}/workorders/table`,
  Inventory: `${BusinessUnitPath}/inventory`,
  InventoryBoard: `${BusinessUnitPath}/inventory-board`,
  Reports: `${BusinessUnitPath}/reports`,
  MapSettings: `/${Routes.Configuration}/map-settings`,
  Drivers: `/${Routes.Configuration}/drivers`,
  Materials: `/${Routes.Configuration}/materials`,
  Sizes: `/${Routes.Configuration}/sizes`,
  Trucks: `/${Routes.Configuration}/trucks`,
  Waypoints: `/${Routes.Configuration}/waypoints`,
  Documents: `/${Routes.Configuration}/documents`,
  Templates: `/${Routes.Configuration}/templates`,
  Trips: `/${Routes.Configuration}/trips`,
  Users: `/${Routes.Configuration}/users`,
  StructuredManifest: `/${Routes.Configuration}/structured-manifest`,

  DriverAapSettings: `/${Routes.Configuration}/driverapp-settings`,

  BusinessUnitPath,
};
