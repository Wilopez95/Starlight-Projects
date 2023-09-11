import { Field, ObjectType } from 'type-graphql';
import { PointScalar } from '../graphql/types/GeoJSON';
import { Point } from 'geojson';
import { CustomerAddress } from '../../../graphql/types/CustomerAddress';
import { HaulingJobSite } from './JobSite';

@ObjectType()
export class HaulingCustomerJobSite {
  @Field()
  id!: number;

  @Field()
  active!: boolean;

  @Field(() => Boolean, { nullable: true })
  poRequired: boolean | null = null;

  @Field({ nullable: true })
  popupNote!: string;

  @Field()
  fullAddress!: string;

  @Field(() => CustomerAddress)
  address!: CustomerAddress;

  @Field(() => PointScalar)
  location!: Point;

  @Field({ nullable: true })
  contactId!: number;

  @Field({ nullable: true })
  originalId!: number;

  @Field()
  jobSite!: HaulingJobSite;
}
