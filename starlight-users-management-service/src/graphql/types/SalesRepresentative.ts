import { InputType, Field, ObjectType } from 'type-graphql';

@ObjectType()
export class SalesRepresentative {
  @Field()
  businessUnitId!: number;

  @Field()
  commissionAmount!: number;
}

@InputType()
export class SalesRepresentativeInput {
  @Field()
  businessUnitId!: number;

  @Field()
  commissionAmount!: number;
}
