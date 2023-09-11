import { ObjectType, Field, InputType } from 'type-graphql';

@ObjectType()
export class Tenant {
  @Field()
  id!: number;

  @Field()
  name!: string;

  @Field()
  legalName!: string;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;

  @Field()
  region!: string;
}

@InputType()
export class TenantInput {
  @Field()
  name!: string;

  @Field()
  legalName!: string;

  @Field()
  rootEmail!: string;
}
