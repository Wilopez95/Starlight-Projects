import BillableServiceInclusionRepo from './BillableServiceInclusionRepo.js';
import SubscriptionLineItemRepo from './SubscriptionLineItemRepo.js';
import RecurringLineItemsGlobalRatesRepo from './RecurringLineItemsGlobalRatesRepo.js';
import RecurringLineItemsCustomRatesRepo from './RecurringLineItemsCustomRatesRepo.js';
import SubscriptionServiceItemRepo from './SubscriptionServiceItemRepo.js';
import RecurringServicesGlobalRatesRepo from './RecurringServicesGlobalRatesRepo.js';
import RecurringServicesCustomRatesRepo from './RecurringServicesCustomRatesRepo.js';
import SubscriptionOrdersRepo from './SubscriptionOrdersRepo.js';
import GlobalRatesServiceRepo from './GlobalRatesServiceRepo.js';
import GlobalRatesRecurringServiceRepo from './GlobalRatesRecurringServiceRepo.js';
import CustomRatesGroupServiceRepo from './CustomRatesGroupServiceRepo.js';
import JobSiteRepo from './JobSiteRepo.js';
import CustomerRepo from './customerRepo.js';
import BillableSurchargeRepo from './BillableSurchargeRepo.js';
import BillableServiceRepo from './BillableServiceRepo.js';

const repos = {
  BillableServiceInclusionRepo,
  SubscriptionLineItemRepo,
  RecurringLineItemsGlobalRatesRepo,
  RecurringLineItemsCustomRatesRepo,
  SubscriptionServiceItemRepo,
  RecurringServicesGlobalRatesRepo,
  RecurringServicesCustomRatesRepo,
  SubscriptionOrdersRepo,
  GlobalRatesServiceRepo,
  GlobalRatesRecurringServiceRepo,
  CustomRatesGroupServiceRepo,
  JobSiteRepo,
  CustomerRepo,
  BillableSurchargeRepo,
  BillableServiceRepo,
};

export default repos;
