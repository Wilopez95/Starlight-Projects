import { ObjectType, InputType, Field, registerEnumType } from 'type-graphql';

enum AdministrativeDistrictLevel {
  city = 'city',
  county = 'county',
  state = 'state',
}

registerEnumType(AdministrativeDistrictLevel, { name: 'AdministrativeDistrictLevel' });

/**
 * @deprecated
 */
@ObjectType()
export class AdministrativeDistrict {
  @Field(() => Number)
  id!: number;

  @Field(() => String)
  name!: string;

  @Field(() => AdministrativeDistrictLevel)
  level!: AdministrativeDistrictLevel;

  @Field(() => String, { defaultValue: null })
  county: string | null = null;

  @Field(() => String, { defaultValue: null })
  city: string | null = null;

  @Field(() => String)
  state!: string;
}

@InputType()
export class DistrictInput {
  @Field(() => String, { defaultValue: null })
  county: string | null = null;

  @Field(() => String, { defaultValue: null })
  city: string | null = null;

  @Field(() => String)
  state!: string;
}

@InputType()
export class AdministrativeDistrictInput extends DistrictInput {
  @Field(() => Number, { nullable: true })
  id?: number;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => AdministrativeDistrictLevel, { nullable: true })
  level?: AdministrativeDistrictLevel;
}
