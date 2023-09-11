import { Field, InputType, Int, ObjectType, registerEnumType } from 'type-graphql';

export enum TaxDistrictType {
  Municipal = 'municipal',
  Secondary = 'secondary',
  Primary = 'primary',
  Country = 'country',
}

registerEnumType(TaxDistrictType, { name: 'TaxDistrictType' });

export enum TaxCalculation {
  Flat = 'flat',
  Percentage = 'percentage',
}

registerEnumType(TaxCalculation, { name: 'TaxCalculation' });

export enum TaxApplication {
  Order = 'order',
  Ton = 'ton',
  Quantity = 'quantity',
  Each = 'each',
  Subscription = 'subscription',
}

registerEnumType(TaxApplication, { name: 'TaxApplication' });

@ObjectType()
export class NonGroupTaxValue {
  @Field()
  id!: number;

  @Field()
  value!: string;
}

@ObjectType({ isAbstract: true })
export class GroupTax {
  @Field()
  group!: boolean;

  @Field({ nullable: true })
  value?: string;

  @Field(() => [Number], { nullable: true })
  exclusions?: number[] | null;

  @Field(() => [NonGroupTaxValue], { nullable: true })
  nonGroup?: NonGroupTaxValue[];
}

@ObjectType()
export class LineItemExclusions {
  @Field(() => [Number])
  thresholds!: number[];

  @Field(() => [Number])
  lineItems!: number[];
}

@ObjectType()
export class NonGroupLineItemTaxValue {
  @Field(() => [NonGroupTaxValue])
  thresholds!: NonGroupTaxValue[];

  @Field(() => [NonGroupTaxValue])
  lineItems!: NonGroupTaxValue[];
}

@ObjectType({ isAbstract: true })
export class GroupLineItemTax {
  @Field()
  group!: boolean;

  @Field({ nullable: true })
  value?: string;

  @Field(() => LineItemExclusions, { nullable: true })
  exclusions?: LineItemExclusions | null;

  @Field(() => NonGroupLineItemTaxValue, { nullable: true })
  nonGroup?: NonGroupLineItemTaxValue;
}

@ObjectType()
export class Tax extends GroupTax {
  @Field(() => TaxCalculation)
  calculation!: TaxCalculation;

  @Field(() => TaxApplication, { nullable: true })
  application!: TaxApplication | null;
}

@ObjectType()
export class LineItemTax extends GroupLineItemTax {
  @Field(() => TaxCalculation)
  calculation!: TaxCalculation;

  @Field(() => TaxApplication, { nullable: true })
  application!: TaxApplication | null;
}

@ObjectType()
export class TaxBusinessConfiguration {
  @Field()
  id!: number;

  @Field(() => LineItemTax)
  commercialLineItems!: LineItemTax;

  @Field(() => Tax)
  commercialMaterials!: Tax;

  @Field(() => Tax)
  commercialRecurringLineItems!: Tax;

  @Field(() => Tax)
  commercialRecurringServices!: Tax;

  @Field(() => Tax)
  commercialServices!: Tax;

  @Field(() => LineItemTax)
  nonCommercialLineItems!: LineItemTax;

  @Field(() => Tax)
  nonCommercialMaterials!: Tax;

  @Field(() => Tax)
  nonCommercialRecurringLineItems!: Tax;

  @Field(() => Tax)
  nonCommercialRecurringServices!: Tax;

  @Field(() => Tax)
  nonCommercialServices!: Tax;

  @Field()
  businessLineId!: number;
}

@ObjectType()
export class HaulingTaxDistrict {
  @Field()
  id!: number;

  @Field()
  userId!: string;

  @Field()
  active!: boolean;

  @Field()
  description!: string;

  @Field(() => TaxDistrictType)
  districtType!: TaxDistrictType;

  @Field()
  includeNationalInTaxableAmount!: boolean;

  @Field()
  useGeneratedDescription!: boolean;

  @Field()
  taxesPerCustomerType!: boolean;

  @Field({ nullable: true })
  taxDescription?: string;

  @Field({ nullable: true })
  districtCode?: string;

  @Field({ nullable: true })
  districtName?: string;

  @Field(() => [TaxBusinessConfiguration], { nullable: true })
  businessConfiguration?: TaxBusinessConfiguration[];

  @Field(() => [Number], { nullable: true })
  businessLineTaxesIds?: number[];

  @Field(() => [Number], { nullable: true })
  bbox?: number[];

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}

@InputType()
export class TaxDistrictFilter {
  @Field()
  customerId!: number;

  @Field(() => Int, { nullable: true })
  jobSiteId: number | null = null;

  @Field(() => Int, { nullable: true })
  originDistrictId: number | null = null;
}
