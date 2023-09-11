import { Field, Int, ObjectType } from 'type-graphql';
import { Length, IsBoolean } from 'class-validator';

@ObjectType()
export class HaulingDriverBU {
  @Field(() => Int)
  id!: number;

  @Length(0, 250)
  @Field(() => String)
  name!: string;
}

@ObjectType()
export class HaulingDriver {
  @Field(() => Int)
  id!: number;

  @IsBoolean()
  @Field()
  active!: boolean;

  @Length(0, 250)
  @Field(() => String)
  description!: string;

  @Length(0, 250)
  @Field(() => String, { nullable: true })
  photoUrl!: string | null;

  @Length(0, 250)
  @Field(() => String, { nullable: true })
  phone!: string | null;

  @Length(0, 250)
  @Field(() => String)
  email!: string;

  @Field(() => [HaulingDriverBU])
  businessUnits!: HaulingDriverBU[];

  @Field(() => Int)
  truckId!: number;

  @Length(0, 250)
  @Field(() => String)
  licenseNumber!: string;

  @Length(0, 250)
  @Field(() => String)
  licenseType!: string;
}
