import Router from '@koa/router';

import { trashApiAccess, salesPointApiAccess, contractorOnly } from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import {
  parseBusinessUnitLineId,
  castQueryParams,
  processSearchQuery,
} from '../../middlewares/requestParamsParser.js';

import { authorized } from '../../middlewares/authorized.js';
import { PERMISSIONS } from '../../consts/permissions.js';
import {
  addressSuggestionsParam,
  suggestionsParam,
  multiSearchParam,
  linkedJobSiteAndCustomer,
  buSwitchParams,
  businessUnitId,
  paginationParams,
  auditLogsParams,
  geofenceSuggestionsParams,
} from './schema.js';
import {
  searchAddressSuggestion,
  advancedSearch,
  getCustomerJobSitePair,
  searchCustomersOrInvoices,
  getNavigationCounts,
  filterAuditLogs,
  geofenceSuggestions,
} from './controller.js';

import adminRoutes from './admin/index.js';
import authRoutes from './auth/index.js';
import customerGroupRoutes from './customerGroups/index.js';
import permitRoutes from './permits/index.js';
import brokerRoutes from './brokers/index.js';
import businessLinesRoutes from './businessLines/index.js';
import businessUnitsRoutes from './businessUnits/index.js';
import thirdPartyHaulersRoutes from './3rdPartyHaulers/index.js';
import equipmentItemRoutes from './equipmentItems/index.js';
import materialRoutes from './materials/index.js';
import materialProfileRoutes from './materialProfiles/index.js';
import billableServiceRoutes from './billableServices/index.js';
import billableLineItemRoutes from './billableLineItems/index.js';
import billableThresholdRoutes from './billableThresholds/index.js';
import billableSurchargesRoutes from './billableSurcharges/index.js';
import rateRoutes from './rates/index.js';
import taxDistrictRoutes from './taxDistricts/index.js';
import disposalSiteRoutes from './disposalSites/index.js';
import promoRoutes from './promos/index.js';
import jobSiteRoutes from './jobSites/index.js';
import customerRoutes from './customers/index.js';
import contactRoutes from './contacts/index.js';
import projectRoutes from './projects/index.js';
import orderRoutes from './orders/index.js';
import companyRoutes from './companies/index.js';
import subscriptionRoutes from './subscriptions/index.js';
import serviceAreaRoutes from './serviceAreas/index.js';
import schedulerRoutes from './schedulers/index.js';
import clockInOutRoutes from './clockInOut/index.js';
import landfillOperationRoutes from './landfillOperations/index.js';
import workOrderRoutes from './orders/workOrders/index.js';
import contractorRoutes from './contractors/index.js';
import salesPointRoutes from './salespoint/index.js';
import contractorAuthRoutes from './contractors/auth/index.js';
import recurrentOrderRoutes from './recurrentOrders/index.js';
import priceGroupRoutes from './priceGroups/index.js';
import priceRoutes from './prices/index.js';
import reminderRoutes from './reminders/index.js';
import purchaseOrdersRoutes from './purchaseOrders/index.js';
import trucksRoutes from './trucks/index.js';
import driversRoutes from './drivers/index.js';
import inventoryRoutes from './inventory/index.js';
import originRoutes from './origins/index.js';
import destinationRoutes from './destinations/index.js';
import operatingCostsRoutes from './operatingCosts/index.js';
import thresholdRoutes from './thresholds/index.js';
import chatsRoutes from './chats/index.js';
import changeReasonsRoutes from './changeReasons/index.js';
import auditLog from './auditLog/index.js';

import lobbyRoutes from './lobby/index.js';
import umsRoutes from './ums/index.js';
import routePlannerRoutes from './routePlanner/index.js';

import customerPortalRoutes from './customerPortal/index.js';
import trashApiRoutes from './trashApi/index.js';

import termsAndConditionsRoutes from './termsAndConditions/index.js';

const router = new Router();

router.use(castQueryParams);
router.use(validate(buSwitchParams, 'query'));
router.use(parseBusinessUnitLineId);

router.use('/admin', adminRoutes);
router.use('/tmp', adminRoutes);
router.use('/auth', authRoutes);
router.use('/lobby', authorized(), lobbyRoutes);

router.use('/business-units', authorized(), businessUnitsRoutes);
router.use('/business-lines', authorized(), businessLinesRoutes);

router.use('/customer-groups', authorized(), customerGroupRoutes);
router.use('/permits', authorized(), permitRoutes);
router.use('/brokers', authorized(), brokerRoutes);
router.use('/3rd-party-haulers', authorized(), thirdPartyHaulersRoutes);

router.use('/companies', authorized(), companyRoutes);
router.use('/equipment-items', authorized(), equipmentItemRoutes);
router.use('/materials', authorized(), materialRoutes);
router.use('/material-profiles', authorized(), materialProfileRoutes);
router.use('/purchase-orders', authorized(), purchaseOrdersRoutes);
router.use('/change-reasons', authorized(), changeReasonsRoutes);

router.use('/billable/services', authorized(), billableServiceRoutes);
router.use('/billable/line-items', authorized(), billableLineItemRoutes);
router.use('/billable/thresholds', authorized(), billableThresholdRoutes);
router.use('/billable/surcharges', authorized(), billableSurchargesRoutes);

router.use('/rates', authorized(), rateRoutes);
router.use('/tax-districts', authorized(), taxDistrictRoutes);

router.use('/disposal-sites', authorized(), disposalSiteRoutes);
router.use('/promos', authorized(), promoRoutes);
router.use('/service-areas', authorized(), serviceAreaRoutes);

router.use('/job-sites', authorized(), jobSiteRoutes);
router.use('/customers', authorized(), customerRoutes);
router.use('/contacts', authorized([PERMISSIONS.customersView]), contactRoutes);
router.use('/projects', authorized([PERMISSIONS.customersView]), projectRoutes);

router.use('/ums', authorized(), umsRoutes);
router.use('/route-planner', authorized(), routePlannerRoutes);

router.use('/terms-conditions', termsAndConditionsRoutes);

router.get('/nav-counts', authorized(), validate(businessUnitId, 'query'), getNavigationCounts);
router.post(
  '/audit-logs',
  authorized(),
  validate(paginationParams, 'query'),
  validate(auditLogsParams),
  filterAuditLogs,
);

router.get(
  '/address-suggestions',
  processSearchQuery.bind(null, 'query', true),
  validate(addressSuggestionsParam, 'query'),
  authorized(),
  searchAddressSuggestion,
);

router.post('/geofence-suggestions', validate(geofenceSuggestionsParams), geofenceSuggestions);

// place order form
router.get(
  '/search/multi',
  authorized(),
  processSearchQuery.bind(null, 'query', true),
  validate(multiSearchParam, 'query'),
  authorized(),
  advancedSearch(true),
);
// single search field
router.get(
  '/search/advanced',
  authorized(),
  processSearchQuery.bind(null, 'query', true),
  validate(suggestionsParam, 'query'),
  advancedSearch(false),
);

router.get(
  '/search/customers-invoices',
  authorized([PERMISSIONS.customersView, PERMISSIONS.billingInvoices]),
  validate(suggestionsParam, 'query'),
  searchCustomersOrInvoices,
);

router.get(
  '/linked',
  authorized([PERMISSIONS.customersView]),
  validate(linkedJobSiteAndCustomer, 'query'),
  getCustomerJobSitePair,
);

router.use('/orders/work-orders/:woNumber', trashApiAccess, workOrderRoutes);

router.use('/orders', orderRoutes);

router.use('/subscriptions', authorized(), subscriptionRoutes);
router.use('/recurrent-orders', authorized(), recurrentOrderRoutes);
router.use('/price-groups', authorized(), priceGroupRoutes);
router.use('/prices', authorized(), priceRoutes);
router.use('/clock-in-out', authorized(), clockInOutRoutes);
router.use('/landfill-operations', authorized(), landfillOperationRoutes);

router.use('/schedulers', authorized(), schedulerRoutes);
router.use('/reminders', authorized(), reminderRoutes);

router.use('/contractors/auth', contractorAuthRoutes);
router.use('/contractors', contractorOnly, contractorRoutes);
router.use('/sales-point', salesPointApiAccess, salesPointRoutes);

router.use('/customer-portal', customerPortalRoutes);

router.use('/trucks', authorized(), trucksRoutes);
router.use('/drivers', authorized(), driversRoutes);

router.use('/inventory', authorized(), inventoryRoutes);
router.use('/origins', authorized(), originRoutes);
router.use('/destinations', authorized(), destinationRoutes);
router.use('/operating-costs', authorized(), operatingCostsRoutes);
router.use('/thresholds', authorized(), thresholdRoutes);

router.use('/trash-api', authorized(), trashApiRoutes);

router.use('/chats', authorized(), chatsRoutes);

router.use('/audit-log', authorized(), auditLog);

export default router.routes();
