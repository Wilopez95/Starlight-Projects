import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class AvailableResourceLogin {
  @Field()
  id!: string;

  @Field()
  label!: string;

  @Field({ nullable: true })
  subLabel!: string;

  @Field({ nullable: true })
  image!: string;

  @Field()
  loginUrl!: string;

  @Field()
  targetType!: string;

  @Field({ nullable: true })
  updatedAt!: string;

  @Field({ nullable: true })
  tenantName!: string;

  @Field({ nullable: true })
  hasGradingAccess!: boolean;

  @Field({ nullable: true })
  hasRecyclingAccess!: boolean;
}
