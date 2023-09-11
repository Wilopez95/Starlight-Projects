import {
  RecurrentFormCustomFrequencyType,
  RecurrentFormFrequencyType,
} from '@root/pages/NewRequest/NewRequestForm/forms/RecurrentOrder/types';
import {
  type IContact,
  type IEntity,
  type IEquipmentItem,
  type IGlobalRateService,
  type IJobSite,
  type IPurchaseOrder,
  type IServiceArea,
} from '@root/types';

import { type VersionedEntity } from '../helpers';

import { IBillableService } from './billableService';
import { IBusinessLine } from './businessLine';
import { IBusinessUnit } from './businessUnit';
import { ICustomer } from './customer';
import { ICustomerJobSitePair } from './customerJobSitePair';
import { IDisposalSite } from './disposalSite';
import { IMaterial } from './material';
import { IMaterialProfile } from './materialProfile';
import { IOrderCustomRatesGroupService, IOrderIncludedLineItem } from './order';
import { IPermit } from './permit';
import { IPriceGroup } from './priceGroup';
import { IProject } from './project';
import { IPromo } from './promo';
import { IThirdPartyHauler } from './thirdPartyHauler';
import { IUser } from './user';

export enum RecurrentOrderStatus {
  active = 'active',
  onHold = 'onHold',
  closed = 'closed',
}
export interface IRecurrentOrder extends IEntity {
  businessUnit: IBusinessUnit;
  businessLine: IBusinessLine;
  jobSite: VersionedEntity<IJobSite>;
  customer: VersionedEntity<ICustomer>;
  csr: VersionedEntity<IUser>;
  jobSiteContact: VersionedEntity<IContact>;
  beforeTaxesTotal: number;
  bestTimeToComeFrom: string;
  bestTimeToComeTo: string;
  billableLineItemsTotal: number;
  billableServicePrice: number;
  billableServiceTotal: number;
  billableServiceQuantity: number;
  billableServiceApplySurcharges: boolean;
  driverInstructions: string | null;
  earlyPick: boolean;
  grandTotal: number;
  surchargesTotal: number;
  applySurcharges: boolean;
  highPriority: boolean;
  initialGrandTotal: number;
  callOnWayPhoneNumber: string | null;
  callOnWayPhoneNumberId: number | null;
  textOnWayPhoneNumber: string | null;
  textOnWayPhoneNumberId: number | null;
  jobSiteNote: string | null;
  purchaseOrder: IPurchaseOrder | null;
  purchaseOrderId: number | null;
  someoneOnSite: boolean;
  toRoll: boolean;
  csrNotes: string | null;
  invoiceNotes: string | null;
  notifyDayBefore: 'byText' | 'byEmail' | null;
  material: VersionedEntity<IMaterial> | null;
  paymentMethod: 'onAccount';
  orderContact: VersionedEntity<IContact>;
  status: RecurrentOrderStatus;
  lineItems: IOrderIncludedLineItem[];
  startDate: Date;
  nextServiceDate: Date;
  frequencyType: RecurrentFormFrequencyType;
  frequencyPeriod?: number;
  customFrequencyType?: RecurrentFormCustomFrequencyType;
  frequencyDays?: number[];
  endDate: Date | null;
  unlockOverrides: boolean;
  lastFailureDate: Date | null;
  billableService: VersionedEntity<IBillableService>;
  equipmentItem?: VersionedEntity<IEquipmentItem>;
  serviceArea?: IServiceArea;
  customerJobSite?: VersionedEntity<ICustomerJobSitePair>;
  thirdPartyHauler?: VersionedEntity<IThirdPartyHauler>;
  globalRatesServices?: VersionedEntity<IGlobalRateService>;
  project?: VersionedEntity<IProject>;
  customRatesGroup?: VersionedEntity<IPriceGroup>;
  disposalSite?: VersionedEntity<IDisposalSite>;
  promo?: VersionedEntity<IPromo>;
  permit?: VersionedEntity<IPermit>;
  materialProfile?: VersionedEntity<IMaterialProfile>;
  customRatesGroupServices?: VersionedEntity<IOrderCustomRatesGroupService>;
}
