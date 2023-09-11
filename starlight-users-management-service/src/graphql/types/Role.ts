import { InputType, Field } from 'type-graphql';
import { RoleStatus } from '../../entities/Role';
import {
  PolicyInput,
  PolicyStatementInput,
  PolicyStatementTemplateInput,
  PolicyTemplateInput,
} from './Policy';

@InputType()
export class RoleInput {
  @Field()
  description!: string;

  @Field(() => RoleStatus)
  status!: RoleStatus;

  @Field(() => [PolicyInput], { nullable: true })
  policies?: PolicyInput[];

  @Field(() => [PolicyTemplateInput], { nullable: true })
  policyTemplates?: PolicyTemplateInput[];

  @Field(() => [PolicyStatementInput], { nullable: true })
  policyStatements?: PolicyStatementInput[];

  @Field(() => [PolicyStatementTemplateInput], { nullable: true })
  policyStatementTemplates?: PolicyStatementTemplateInput[];
}
