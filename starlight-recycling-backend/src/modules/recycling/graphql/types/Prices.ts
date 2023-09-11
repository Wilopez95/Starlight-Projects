import { ObjectType, Field, InputType } from 'type-graphql';
import { Min, Max } from 'class-validator';

@ObjectType()
export class Price {
  @Field()
  price!: number;

  @Field()
  id!: number;
}

@ObjectType()
export class BasedOnMaterialsPrices {
  @Field()
  id!: number;

  @Field(() => [Price])
  prices!: Price[];
}

@InputType()
export class PriceInput {
  @Min(0)
  @Max(9999999999)
  @Field()
  price!: number;

  @Field()
  id!: number;
}

@InputType()
export class PriceBasedOnMaterialsInput {
  @Field()
  id!: number;

  @Field(() => [PriceInput])
  prices!: PriceInput[];
}
