import { Field, InputType, Int, ObjectType, registerEnumType } from 'type-graphql';
import { HaulingPriceGroupsResultLevel } from './HaulingPriceGroup';
import { HaulingBusinessUnit } from './HaulingBusinessUnit';
import { HaulingJobSite } from './HaulingJobSite';
import { HaulingBillableItem } from '../../../modules/recycling/entities/BillableItem';
import { HaulingMaterial } from './HaulingMaterial';
import { DisposalSite } from './DisposalSite';
import { HaulingTaxDistrict } from './HaulingTaxDistrict';
import { HaulingBusinessLine } from './HaulingBusinessLine';
import { HaulingProject } from './HaulingProject';

@ObjectType()
export class HaulingWorkOrder {
  @Field()
  woNumber!: number;

  @Field()
  truck!: string;
}

export interface HaulingOrderPurchaseOrder {
  poNumber: string;
}

export interface HaulingOrderBaseEntity {
  id: number;
  originalId: number;
}

export enum HaulingOrderStatus {
  inProgress = 'inProgress',
  completed = 'completed',
  approved = 'approved',
  finalized = 'finalized',
  canceled = 'canceled',
  invoiced = 'invoiced',
}

export enum HaulingOrderPaymentStatus {
  captured = 'captured',
  authorized = 'authorized',
  failed = 'failed',
  voided = 'voided',
}
export interface HaulingOrderPayment {
  id: number;
  status: HaulingOrderPaymentStatus;
  paymentType: HaulingPaymentMethod;
  checkNumber: string | null;
  isAch: boolean | null;
  creditCardId: number | null;
}

interface Threshold {
  id: number;
  originalId: number;
}

interface ThresholdItem {
  id: number;
  threshold: Threshold;
}

@ObjectType()
export class HaulingOrder {
  @Field()
  id!: number;

  @Field(() => HaulingWorkOrder)
  workOrder!: HaulingWorkOrder;

  purchaseOrder!: HaulingOrderPurchaseOrder;

  project?: HaulingProject;
  jobSiteContact?: HaulingOrderBaseEntity;
  orderContact?: HaulingOrderBaseEntity;
  customRatesGroup?: HaulingOrderBaseEntity;
  customRatesGroupServices?: HaulingOrderBaseEntity;

  businessLine!: HaulingBusinessLine;
  customer!: HaulingOrderBaseEntity;
  material!: HaulingOrderBaseEntity;
  billableService!: HaulingOrderBaseEntity;
  customerJobSite!: HaulingOrderBaseEntity;
  equipmentItem!: HaulingOrderBaseEntity;
  serviceArea!: HaulingOrderBaseEntity;
  globalRatesServices!: HaulingOrderBaseEntity;

  disposalSite!: DisposalSite;
  businessUnit!: HaulingBusinessUnit;
  jobSite!: HaulingJobSite;
  status!: HaulingOrderStatus;
  noBillableService!: boolean;
  notifyDayBefore!: string | null;
  billableServicePrice!: number;
  billableServiceApplySurcharges!: boolean;
  lineItems?: Array<{
    billableLineItemId: number;
    materialId: number | null;
    globalRatesLineItemsId: number;
    customRatesGroupLineItemsId?: number;
    price: number;
    quantity: number;
    applySurcharges: boolean;
    billableLineItem?: HaulingBillableItem;
    material?: HaulingMaterial;
  }>;
  serviceDate!: Date;
  applySurcharges!: boolean;
  payments?: HaulingOrderPayment[];
  thresholds?: [ThresholdItem];

  taxDistricts?: HaulingTaxDistrict[];
}

@InputType()
export class BillableServiceCalculateInput {
  @Field({ nullable: true })
  billableServiceId?: number;

  @Field({ nullable: true })
  equipmentItemId?: number;

  @Field(() => Int, { nullable: true })
  materialId: number | null = null;
}

@InputType()
export class BillableLineItemInput {
  @Field()
  lineItemId!: number;

  @Field(() => Int, { nullable: true })
  materialId: number | null = null;
}

@InputType()
export class HaulingCalculateRatesInput {
  @Field(() => HaulingPriceGroupsResultLevel)
  type!: HaulingPriceGroupsResultLevel;

  @Field({ nullable: true })
  customRatesGroupId?: number;

  @Field(() => BillableServiceCalculateInput, { nullable: true })
  billableService?: BillableServiceCalculateInput;

  @Field(() => [BillableLineItemInput], { nullable: true })
  billableLineItems?: BillableLineItemInput[];
}

@ObjectType()
export class HaulingRatesServiceResult {
  @Field()
  id!: number;

  @Field()
  price!: number;
}

@ObjectType()
export class HaulingRatesLineItemResult extends HaulingRatesServiceResult {
  @Field()
  lineItemId!: number;

  @Field(() => Int, { nullable: true })
  materialId!: number | null;
}

@ObjectType()
export class HaulingGlobalRates {
  @Field(() => HaulingRatesServiceResult)
  globalRatesService?: HaulingRatesServiceResult;

  @Field(() => [HaulingRatesLineItemResult], { nullable: true })
  globalRatesLineItems?: HaulingRatesLineItemResult[];
}
@ObjectType()
export class HaulingCustomRates {
  @Field(() => HaulingRatesServiceResult, { nullable: true })
  customRatesService?: HaulingRatesServiceResult;

  @Field(() => [HaulingRatesLineItemResult], { nullable: true })
  customRatesLineItems?: HaulingRatesLineItemResult[];
}

@ObjectType()
export class HaulingCalculateRatesResult {
  @Field(() => HaulingGlobalRates, { nullable: true })
  globalRates?: HaulingGlobalRates;

  @Field(() => HaulingCustomRates, { nullable: true })
  customRates?: HaulingCustomRates;
}

@ObjectType()
export class CreateHaulingOrderResult {
  @Field()
  id!: number;
}

export enum HaulingPaymentMethod {
  onAccount = 'onAccount',
  creditCard = 'creditCard',
  cash = 'cash',
  check = 'check',
  mixed = 'mixed',
}

registerEnumType(HaulingPaymentMethod, { name: 'HaulingPaymentMethod' });
