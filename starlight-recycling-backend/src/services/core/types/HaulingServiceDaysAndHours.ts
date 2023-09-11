import { Field, InputType, ObjectType } from 'type-graphql';

@ObjectType()
export class HaulingServiceDaysAndHours {
  @Field()
  id!: number;
  @Field(() => Number)
  businessUnitId!: number;
  @Field(() => Number)
  dayOfWeek!: number | null;
  @Field(() => String, { nullable: true })
  startTime!: string | null;
  @Field(() => String, { nullable: true })
  endTime!: string | null;
}

@InputType()
export class HaulingServiceDaysAndHoursInput {
  @Field({ nullable: true })
  id!: number;

  @Field({ nullable: true })
  businessUnitId?: number;

  @Field({ nullable: true })
  dayOfWeek!: number;

  @Field({ nullable: true })
  startTime!: string;

  @Field({ nullable: true })
  endTime!: string;
}

@InputType()
export class HaulingServiceDaysAndHoursUpdateInput extends HaulingServiceDaysAndHoursInput {}

@InputType()
export class HaulingServiceDaysAndHoursFilter extends HaulingServiceDaysAndHoursInput {}
