import { InputType, Field } from 'type-graphql';

import { OrderImage } from '../../entities/Order';

@InputType()
export class OrderMaterialDistributionInput {
  @Field()
  uuid!: string;

  @Field()
  materialId!: number;

  @Field()
  value!: number;
}

@InputType()
export class OrderMiscellaneousMaterialDistributionInput {
  @Field()
  uuid!: string;

  @Field()
  materialId!: number;

  @Field()
  quantity!: number;
}

@InputType()
export class GradingPayloadInput {
  @Field()
  orderId!: number;

  @Field(() => [OrderMaterialDistributionInput])
  materialsDistribution?: OrderMaterialDistributionInput[];

  @Field(() => [OrderMiscellaneousMaterialDistributionInput])
  miscellaneousMaterialsDistribution?: OrderMiscellaneousMaterialDistributionInput[];

  @Field(() => [OrderImage], { nullable: true })
  images!: OrderImage[];
}
