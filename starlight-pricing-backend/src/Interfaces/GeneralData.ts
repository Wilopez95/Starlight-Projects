import { OrderTaxDistrict } from '../database/entities/tenant/OrderTaxDistrict';
import { ThresholdItems } from '../database/entities/tenant/ThresholdItems';
import { IBillableService } from './BillableService';
import { IBusinessLine } from './BusinessLine';
import { IBusinessUnit } from './BusinessUnit';
import { IContact } from './Contact';
import { ICustomer } from './Customer';
import { ICustomerJobSitePair } from './CustomerJobSite';
import { ICustomRateSurcharge } from './CustomRatesGroupSurcharges';
import { IEquipmentItem } from './EquipmentItem';
import { IFrequency } from './Frequency';
import { IGlobalRateLineItem } from './GlobalRateLineItem';
import { IGlobalRateSurcharge } from './GlobalRateSurcharge';
import { IJobSite } from './JobSite';
import { ILineItem, IOrderIncludedLineItem } from './LineItems';
import { IMaterial } from './Material';
import { IPurchaseOrder } from './PurchaseOrder';
import { IServiceArea } from './ServiceArea';
import { ISurcharge } from './Surcharge';
import { IThirdPartyHauler } from './ThirdPartyHauler';
import { IWorkOrder } from './WorkOrder';

export interface IGeneralData {
  taxDistricts?: OrderTaxDistrict[];
  lineItems: IOrderIncludedLineItem[];
  thresholds?: ThresholdItems[];
  material?: IMaterial;
  billableLineItem?: ILineItem;
  globalRatesLineItem?: IGlobalRateLineItem;
  globalRatesSurcharge?: IGlobalRateSurcharge;
  customRatesGroupSurcharge?: ICustomRateSurcharge;
  surcharge?: ISurcharge;
  billableService?: IBillableService;
  frequencies?: IFrequency[];
  serviceArea?: IServiceArea;
  jobSite?: IJobSite;
  customer?: ICustomer;
  businessUnit?: IBusinessUnit;
  businessLine?: IBusinessLine;
  thirdPartyHauler?: IThirdPartyHauler;
  purchaseOrder?: IPurchaseOrder;
  orderContact?: IContact;
  jobSiteContact?: IContact;
  customerJobSite?: ICustomerJobSitePair;
  equipmentItem?: IEquipmentItem;
  workOrder?: IWorkOrder;
  materialIdList?: IGetIndex[];
  paymentTermsIdList?: IGetIndex[];
}

export interface IGetIndex {
  id: number;
}

export interface IRequesParamsGeneral {
  materialIds?: number;
  paymentTermsIds?: string;
  businessLineId?: number;
  workOrderId?: number;
  jobSiteId?: number;
  isRollOff?: boolean;
  customerId?: number;
  billableServiceId?: number;
  materialId?: number | null;
  equipmentItemId?: number;
  serviceAreaId?: number;
  businessUnitId?: number;
  purchaseOrderId?: number;
  taxDistricts?: number | number[];
  permitId?: number;
  customRatesGroupId?: number;
  customRatesGroupServicesId?: number;
  orderContactIdHistoById?: number;
  jobSiteContactIdHistoById?: number;
  customerJobSiteId?: number;
  disposalSiteId?: number;
  thirdPartyHaulerId?: number;
  promoId?: number;
  projectId?: number;
  landfillOperationId?: number;
  thresholdId?: number;
  globalRatesThresholdsId?: number;
  customRatesGroupThresholdsId?: number;
  taxDistrictId?: number;
  surchargeId?: number;
  globalRatesSurchargesId?: number;
  customRatesGroupSurchargesId?: number;
  materialId_Histo?: number | null;
  billableLineItemId?: number;
  customRatesGroupLineItemsId?: number;
  globalRatesLineItemsId?: number | null;
  customerId_Histo?: number;
  orderContactId?: number;
  billableServiceId_Histo?: number;
  surchargeId_Histo?: number;
  billableLineItemIdHisto?: number;
  globalRatesSurchargesId_Histo?: number | null;
  customRatesGroupSurchargesId_Histo?: number | null;
  frequencyIds?: number[] | null;
  orderContactIdHisto?: number | null;
  jobSiteContactIdHisto?: number | null;
  serviceAreaId_Histo?: number[] | number | null;
  jobSiteId_Histo?: number[] | number | null;
  jobSiteContactId?: number[] | number | string | null;
}

export interface IGetOrderData {
  data: IRequesParamsGeneral;
}

export interface IRoutePlannerDetails {
  businessUnitId?: number;
  businessLineId?: number;
  jobSiteNote?: string;
  subscriptionId?: number;
  serviceItemId?: number;
  customerId?: number;
  jobSiteId?: number;
  serviceAreaId?: number;
  materialId?: number;
  jobSiteContactId?: number;
  billableServiceId?: number;
  billableServiceDescription?: string;
  equipmentItemId?: number;
  equipmentItemSize?: number | null;
}
