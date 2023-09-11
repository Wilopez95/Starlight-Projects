import { Field, ObjectType, registerEnumType } from 'type-graphql';

@ObjectType()
export class HaulingCompany {
  @Field()
  id!: number;

  @Field()
  timeZoneName!: string;

  @Field()
  clockIn!: boolean;

  @Field()
  financeChargeApr!: number;

  @Field()
  financeChargeMethod!: string;

  @Field()
  financeChargeMinValue!: number;

  @Field()
  financeChargeMinBalance!: number;
}

@ObjectType()
export class HaulingCompanyRegionalSettings {
  @Field()
  name!: string;

  @Field()
  region!: string;

  @Field()
  legalName!: string;
}

export enum HaulingMeasurementUnit {
  us = 'us',
  imperial = 'imperial',
  metric = 'metric',
}

registerEnumType(HaulingMeasurementUnit, { name: 'HaulingMeasurementUnit' });

@ObjectType()
export class HaulingCompanyGeneralSettings {
  @Field()
  id!: number;

  @Field()
  timeZoneName!: string;

  @Field(() => HaulingMeasurementUnit)
  unit!: HaulingMeasurementUnit;

  @Field()
  clockIn!: boolean;
}
