import { Subscriptions } from '../database/entities/tenant/Subscriptions';
import { IUser } from './Auth';
import { IBillableService } from './BillableService';
import { IBusinessLine } from './BusinessLine';
import { IBusinessUnit } from './BusinessUnit';
import { IContact } from './Contact';
import { ICustomer } from './Customer';
import { ICustomerJobSitePair } from './CustomerJobSite';
import { IFrequency } from './Frequency';
import { IJobSite, IJobSiteAddress } from './JobSite';
import { ILineItem } from './LineItems';
import { IPurchaseOrder } from './PurchaseOrder';
import { IServiceArea } from './ServiceArea';
import { IProcessServiceItemsResponse } from './ServiceItems';
import { ISubscriptionLineItem } from './SubscriptionLineItem';
import { ISubscriptionServiceItem } from './SubscriptionServiceItem';
import { IThirdPartyHauler } from './ThirdPartyHauler';

export type TypeInvoiceConstruction = 'byAddress' | 'byCustomer' | 'byOrder';
export interface ISubscriptionExtends extends Subscriptions {
  serviceFrequencyAggregated: IFrequency;
  serviceName: string;
  serviceItems?: ISubscriptionServiceItem[];
  subscriptionServiceItems?: ISubscriptionServiceItem[];
  business_line_id: number;
  business_unit_id: number;
  recurringGrandTotal: number;
  customer?: ICustomer;
  jobSite?: IJobSite;
  businessLine?: IBusinessLine;
  businessUnit?: IBusinessUnit;
  serviceArea?: IServiceArea;
  billableService?: IBillableService;
  jobSiteContact?: IContact;
  subscriptionContact?: IContact;
  competitor?: null;
  purchaseOrder?: IPurchaseOrder;
  lineItems?: ILineItem[];
  csr?: IUser;
  thirdPartyHauler?: IThirdPartyHauler;
  customerJobSite?: ICustomerJobSitePair;
  nextServiceDate?: Date;
  jobSiteAddress?: IJobSiteAddress;
  customerOriginalId?: number;
  jobSiteId: number;
  customerId: number;
  lastSubOrderDate?: Date;
}
export interface IServiceDayOfWeek {
  day: string;
  [dayNumber: number]: {
    requiredByCustomer: boolean;
    route?: string;
  };
}
export interface INewSubscriptionService {
  id: number;
  lineItems?: ISubscriptionLineItem[];
  quantity: number;
  effectiveDate: Date | null;
  serviceFrequencyId: number | null;
  serviceDaysOfWeek: IServiceDayOfWeek[];
  unlockOverrides: boolean;
  price: number;
  billableServiceId?: number;
  billableServiceAction?: string;
  customRatesGroupServicesId?: number;
  globalRatesRecurringServicesId?: number;
  materialId?: number;
  subscriptionId?: number;
  shortDescription?: string;
  billableServiceInclusion?: string;
  billableServiceInclusionIds?: number[];
  billingCycle?: string;
  showEffectiveDate?: boolean;
  isDeleted?: boolean;
  billableService?: IBillableService;
  changeReason?: string;
}

export interface IQueryFiltersSub {
  customerId?: string | string[];
  businessLine?: string | string[];
  mine?: string | string[];
  email?: string | string[];
}

export interface ISubscriptionsPaginatedQuery {
  skip?: number;
  limit?: number;
  status?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
  customerId?: string | string[];
  businessLineId?: string | string[];
  mine?: string | string[];
  csrEmail?: string | string[];
  businessLine?: string | string[];
  email?: string | string[];
  query?: string;
  id?: number;
}

interface IISummaryCountStatus {
  active: number;
  closed: number;
  draft: number;
  onHold: number;
}
export interface ISummaryCount {
  total: number;
  statuses: IISummaryCountStatus;
}

export interface ISubscriptionsListBody {
  businessUnitId?: number;
  csrEmail?: string;
  customerId?: number;
  status?: string;
  skip?: number;
  limit?: number;
  subIds?: number[];
}

export interface IProcessSubscriptions {
  subscriptions: ISubscriptionExtends[];
  invoiceConstruction: TypeInvoiceConstruction;
}

export interface IProcessSubscriptionsDraftSubscription {
  id: number;
  totalPriceForSubscription: number;
  nextBillingPeriodTo: Date;
  nextBillingPeriodFrom: Date;
  summaryPerServiceItem: IProcessServiceItemsResponse[];
  anniversaryBilling: boolean;
  billingCycle: string;
  billingType: string;
  startDate: Date;
  endDate: Date;
  jobSiteAddress?: IJobSiteAddress;
  customerId: number;
  businessUnitId: number;
  businessLineId: number;
  status: string;
  customerOriginalId?: number;
  serviceItems?: ISubscriptionServiceItem[];
}

export interface IProcessSubscriptionsDraft {
  jobSiteId: number;
  subscriptions?: IProcessSubscriptionsDraftSubscription[];
}
export interface IProcessSubscriptionsResponse {
  invoicesTotal: number;
  proceedSubscriptions: number;
  drafts: IProcessSubscriptionsDraft[];
  price: number;
}
export interface IGenerateSubscriptionsDraftsBody {
  customerId: number;
}
