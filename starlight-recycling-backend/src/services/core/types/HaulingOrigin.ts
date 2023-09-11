import { Field, InputType, ObjectType } from 'type-graphql';
import { HaulingOriginDistrict, HaulingOriginDistrictInput } from './HaulingOriginDistrict';
import { IsBoolean, Length, IsOptional } from 'class-validator';

@ObjectType()
export class HaulingOrigin {
  @Field()
  id!: number;
  @Field(() => Boolean)
  active!: boolean;
  @Field(() => String)
  description!: string;
  @Field(() => String)
  businessUnitId!: number;

  @Field(() => [HaulingOriginDistrict])
  originDistricts!: HaulingOriginDistrict[];
}

@InputType()
export class OriginInput {
  @Length(0, 100)
  @Field()
  description!: string;

  @IsBoolean()
  @Field()
  active!: boolean;

  @Field(() => [HaulingOriginDistrictInput])
  originDistricts!: HaulingOriginDistrictInput[];

  @Field({ nullable: true })
  @IsOptional()
  businessUnitId?: number;
}

@InputType()
export class OriginUpdateInput extends OriginInput {
  @Field()
  id!: number;
}
