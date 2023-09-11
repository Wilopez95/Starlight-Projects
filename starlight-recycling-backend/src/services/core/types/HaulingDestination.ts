import { Field, InputType, ObjectType } from 'type-graphql';
import { IsBoolean, Length, IsOptional } from 'class-validator';
import { FeatureScalar } from '../../../modules/recycling/graphql/types/GeoJSON';
import { Feature } from 'geojson';

@ObjectType()
export class HaulingDestination {
  @Field()
  id!: number;

  @Field()
  description!: string;

  @Field()
  active!: boolean;

  @Field()
  addressLine1!: string;

  @Field({ nullable: true })
  addressLine2?: string;

  @Field()
  state!: string;

  @Field()
  city!: string;

  @Field()
  zip!: string;

  @Field(() => FeatureScalar, { defaultValue: null })
  geojson: Feature | null = null;

  @Field(() => String)
  businessUnitId!: number;
}

@InputType()
export class HaulingDestinationInput {
  @Length(0, 100)
  @Field()
  description!: string;

  @IsBoolean()
  @Field()
  active!: boolean;

  @Length(0, 200)
  @Field()
  addressLine1!: string;

  @Length(0, 200)
  @Field({ nullable: true })
  @IsOptional()
  addressLine2?: string;

  @Length(0, 100)
  @Field()
  state!: string;

  @Length(0, 100)
  @Field()
  city!: string;

  @Length(0, 100)
  @Field()
  zip!: string;

  @Field(() => FeatureScalar, { defaultValue: null })
  @IsOptional()
  geojson: Feature | null = null;

  @Field({ nullable: true })
  @IsOptional()
  businessUnitId?: number;
}

@InputType()
export class HaulingDestinationUpdateInput extends HaulingDestinationInput {
  @Field()
  id!: number;
}
