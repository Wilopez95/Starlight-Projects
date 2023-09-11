import { ObjectType, Field, InputType } from 'type-graphql';
import { Geometry } from 'geojson';

import { GeometryScalar } from '../graphql/types/GeoJSON';

@ObjectType()
export class HaulingJobSiteAddress {
  @Field()
  addressLine1!: string;

  @Field(() => String, { nullable: true })
  addressLine2?: string | null;

  @Field()
  city!: string;

  @Field()
  state!: string;

  @Field()
  zip!: string;

  @Field({ nullable: true })
  region!: string;
}

@InputType()
export class HaulingJobSiteAddressInput {
  @Field()
  addressLine1!: string;

  @Field(() => String, { nullable: true })
  addressLine2?: string | null;

  @Field()
  city!: string;

  @Field()
  state!: string;

  @Field()
  zip!: string;

  @Field()
  region!: string;
}

@InputType()
export class HaulingJobSiteInput {
  @Field(() => HaulingJobSiteAddressInput)
  address!: HaulingJobSiteAddressInput;

  @Field()
  alleyPlacement!: boolean;

  @Field()
  cabOver!: boolean;

  @Field(() => GeometryScalar)
  location!: Geometry;
}

@ObjectType()
export class HaulingJobSite extends HaulingJobSiteInput {
  @Field()
  id!: number;

  @Field(() => HaulingJobSiteAddress)
  address!: HaulingJobSiteAddress;

  @Field()
  alleyPlacement!: boolean;

  @Field({ nullable: true })
  fullAddress!: string;

  @Field({ nullable: true })
  popupNote!: string;

  @Field()
  cabOver!: boolean;

  @Field(() => GeometryScalar)
  location!: Geometry;
}

@InputType()
export class HaulingJobSiteUpdateInput extends HaulingJobSiteInput {
  @Field()
  id!: number;
}
