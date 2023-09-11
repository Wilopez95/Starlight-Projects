import { Params } from './Params';
import { Routes } from './Routes';

export const BusinessUnitPath = `/${Routes.BusinessUnits}/${Params.businessUnit}`;
export const CustomerPath = `${BusinessUnitPath}/${Routes.Customer}/${Params.customerId}`;

export const RouteModules = {
  BusinessUnit: BusinessUnitPath,

  BusinessUnitConfiguration: `${BusinessUnitPath}/${Routes.Configuration}/${Params.businessLine}?`,

  //TODO remove this trash
  BusinessUnitConfigurationFull: `${BusinessUnitPath}/${Routes.Configuration}/${Params.businessLine}?/${Params.path}?/${Params.subPath}?`,

  Orders: `${BusinessUnitPath}/${Routes.Orders}`,
  Chats: `${BusinessUnitPath}/${Routes.Chats}`,
  Subscriptions: `${BusinessUnitPath}/${Routes.Subscriptions}`,
  Customers: `${BusinessUnitPath}/${Routes.Customers}`,
  JobSites: `${BusinessUnitPath}/${Routes.JobSites}`,
  LandfillOperations: `${BusinessUnitPath}/${Routes.LandfillOperations}`,
  Reports: `${BusinessUnitPath}/${Routes.Reports}`,
  Billing: `${BusinessUnitPath}/${Routes.Billing}`,
  Request: `${BusinessUnitPath}/${Routes.Request}`,

  SystemConfiguration: `/${Routes.Configuration}`,

  Customer: CustomerPath,
  CustomerJobSite: `${CustomerPath}/${Routes.JobSites}/${Params.jobSiteId}`,
  CustomerSubscriptions: `${CustomerPath}/${Routes.OrdersAndSubscriptions}/${Routes.Subscriptions}/${Params.tab}`,
  CustomerRecurrentOrders: `${CustomerPath}/${Routes.OrdersAndSubscriptions}/${Routes.RecurrentOrders}`,
};
