import { Field, InputType, Int, ObjectType } from 'type-graphql';
import { IsBoolean, IsOptional, Length } from 'class-validator';

@ObjectType()
export class HaulingProject {
  @Field()
  id!: number;

  @Field()
  originalId!: number;

  @Field()
  customerJobSiteId!: number;

  @Field()
  description!: string;

  @Field(() => String, { defaultValue: null, nullable: true })
  startDate?: string | null = null;

  @Field(() => String, { defaultValue: null, nullable: true })
  endDate?: string | null = null;

  @Field()
  poRequired!: boolean;

  @Field()
  permitRequired!: boolean;
}

@InputType()
export class ProjectInput {
  @Field()
  @Length(0, 200)
  description!: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  startDate?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  endDate?: string;

  @Field()
  @IsBoolean()
  purchaseOrder?: boolean;

  @Field(() => Int)
  customerJobSiteId!: number;

  generatedId?: string;

  @IsBoolean()
  poRequired?: boolean;

  @IsBoolean()
  permitRequired?: boolean;
}

@InputType()
export class ProjectUpdateInput extends ProjectInput {
  @Field()
  id!: number;
}

@InputType()
export class HaulingProjectFilter {
  @Field(() => Int, { nullable: true })
  customerJobSiteId?: number;
}
