import { QueryPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { LineItems } from '../database/entities/tenant/LineItems';
import { Orders } from '../database/entities/tenant/Orders';
import { OrdersHistorical } from '../database/entities/tenant/OrdersHistorical';
import { OrderTaxDistrict } from '../database/entities/tenant/OrderTaxDistrict';
import { ThresholdItems } from '../database/entities/tenant/ThresholdItems';
import { IBillableService } from './BillableService';
import { IBusinessLine } from './BusinessLine';
import { IBusinessUnit } from './BusinessUnit';
import { ICustomer } from './Customer';
import { IJobSite } from './JobSite';
import { ISurchargeItem } from './SurchargeItem';
export interface IOrderResolver {
  order_request_id: number;
  price_id: number;
}

export interface IWhereOrders extends Orders {
  business_unit_id?: number | string | null;
  business_line_id?: number | string | null;
  order_request_id?: number | string | null;
  is_roll_off?: boolean | null;
  price_id?: number | string | null;
}

interface IStatusCount {
  inProgress: number;
  completed: number;
  approved: number;
  finalized: number;
  canceled: number;
  invoiced: number;
}
export interface IGetCountResponse {
  total: number;
  filteredTotal: number;
  statuses?: IStatusCount;
}

export interface IOrderCount {
  counter: number;
  status: string;
}

export interface IOrdersSelect extends Orders {
  taxDistricts?: OrderTaxDistrict[];
  lineItems?: QueryPartialEntity<LineItems>[];
  thresholds?: QueryPartialEntity<ThresholdItems>[];
}

export interface IOrderTemplate {
  id: number;
  workOrderId: number;
  serviceDate: Date;
  status: string;
  billableServiceId: number;
  grandTotal: number;
  materialId: number;
  businessUnitId: number;
  businessLineId: number;
}

export interface IOrderExtends extends Orders, OrdersHistorical {
  businessUnit: IBusinessUnit;
  businessLine: IBusinessLine;
  jobSite: IJobSite;
  billableService: IBillableService;
  customer: ICustomer;
  thresholds?: QueryPartialEntity<ThresholdItems>[];
  lineItems?: QueryPartialEntity<LineItems>[];
  surcharges?: ISurchargeItem[];
}

export interface IUpdateOrders {
  businessUnitId: number;
  businessLineId: number;
  customRatesGroupId: number;
  applySurcharges: boolean;
  billableServicePrice: number;
}

export interface IgetOrdersFilterQuery {
  limit?: string | null;
  skip?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
  finalizedOnly?: string | null;
  businessUnitId?: string | null;
  mine?: string | null;
  status?: string | null;
  filterByMaterials?: string;
  filterByPaymentTerms?: string;
  filterByPaymentMethod?: string;
  filterByServiceDateTo?: Date;
  filterByServiceDateFrom?: Date;
  filterByWeightTicket?: boolean;
  filterByBusinessLine?: string;
  filterByBroker?: string;
  filterByCsr?: string;
  filterByHauler?: string;
  filterByService?: string;
}

export interface IgetOrdersFilterBody {
  workOrderId?: number;
  id?: number;
  disposalSite?: number;
  customerId?: number;
  originalCustomerId?: number;
  serviceDate?: Date;
  orderIds?: number[];
}
