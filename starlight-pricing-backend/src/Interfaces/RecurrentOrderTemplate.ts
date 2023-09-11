import { RecurrentOrderTemplate } from '../database/entities/tenant/RecurrentOrderTemplates';
import { IBillableService } from './BillableService';
import { IBusinessLine } from './BusinessLine';
import { IBusinessUnit } from './BusinessUnit';
import { IContact } from './Contact';
import { ICustomer } from './Customer';
import { ICustomerJobSitePair } from './CustomerJobSite';
import { IEquipmentItem } from './EquipmentItem';
import { IGlobalRateLineItem } from './GlobalRateLineItem';
import { IJobSite } from './JobSite';
import { ILineItem, IOrderIncludedLineItem } from './LineItems';
import { IMaterial } from './Material';
import { IPurchaseOrder } from './PurchaseOrder';
import { IServiceArea } from './ServiceArea';
import { IThirdPartyHauler } from './ThirdPartyHauler';
import { IWorkOrder } from './WorkOrder';

export interface IRecurrentOrderTemplateResolver {
  price_group_id: number;
  price_id: number;
}

export interface IWhereRecurrentOrderTemplate extends RecurrentOrderTemplate {
  business_line_id?: number | null;
  business_unit_id?: number | null;
  price_group_id?: number | null;
  price_id?: number | null;
}

export interface IcountNotFinalized {
  id: number;
}

export interface IRecurrentOrderTemplateGeneratedOrders extends RecurrentOrderTemplate {
  lineItems?: IOrderIncludedLineItem[];
  material?: IMaterial;
  billableLineItem?: ILineItem;
  globalRatesLineItem?: IGlobalRateLineItem;
}

export interface IRecurrentOrderTemplateGeneratedOrdersResponse {
  lineItems?: IOrderIncludedLineItem[];
  material?: IMaterial;
  billableLineItem?: ILineItem;
  globalRatesLineItem?: IGlobalRateLineItem;
  workOrderId: number;
  serviceDate: Date;
  billableService?: IBillableService;
  businessUnit?: IBusinessUnit;
  businessLine?: IBusinessLine;
  workOrder?: IWorkOrder;
  id: number;
  status: string;
  billableServiceId: number;
  grandTotal: number;
  materialId: number;
  businessUnitId: number;
  businessLineId: number;
}

export interface IRecurrentOrderFull extends RecurrentOrderTemplate {
  material?: IMaterial;
  thirdPartyHauler?: IThirdPartyHauler;
  workOrder?: IWorkOrder;
  serviceArea?: IServiceArea;
  businessUnit?: IBusinessUnit;
  purchaseOrder?: IPurchaseOrder;
  orderContact?: IContact;
  jobSiteContact?: IContact;
  equipmentItem?: IEquipmentItem;
  customerJobSite?: ICustomerJobSitePair;
  customer?: ICustomer;
  businessLine?: IBusinessLine;
  jobSite: IJobSite;
}
