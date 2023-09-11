import { InputType, Field } from 'type-graphql';

@InputType()
export class HaulingEntityFilter {
  @Field({ nullable: true })
  skip?: number;

  @Field({ nullable: true })
  limit?: number;

  @Field({ nullable: true })
  sortBy?: number;

  @Field({ nullable: true })
  sortOrder?: number;

  @Field({ nullable: true })
  customerGroupId?: number;

  @Field({ nullable: true })
  businessUnitId?: number;

  @Field({ nullable: true })
  query?: string;

  @Field({ nullable: true })
  activeOnly?: boolean;
}
