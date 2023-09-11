import { Resolver, InputType, Field, Int, Mutation, Ctx, Arg, Query } from 'type-graphql';

import { Authorized } from '../../../../graphql/decorators/Authorized';
import {
  createHaulerProjectOnCore,
  projectService,
} from '../../../../services/core/haulingProject';
import { QueryContext } from '../../../../types/QueryContext';
import {
  HaulingProject,
  HaulingProjectFilter,
  ProjectInput,
} from '../../../../services/core/types/HaulingProject';
import { coreErrorHandler } from './utils/coreErrorHandler';

@InputType()
export class ProjectFilter {
  @Field(() => Boolean, { defaultValue: false })
  purchaseOrder = false;

  @Field(() => Int, { defaultValue: null })
  customerJobSiteId?: number;
}

@Resolver()
export default class ProjectResolver {
  @Authorized(['recycling:Project:create', 'recycling:YardConsole:perform'])
  @Mutation(() => HaulingProject, { nullable: true })
  async createHaulingProject(
    @Ctx() ctx: QueryContext,
    @Arg('input', () => ProjectInput) input: ProjectInput,
  ): Promise<HaulingProject> {
    try {
      return await createHaulerProjectOnCore(ctx, input);
    } catch (e) {
      coreErrorHandler(ctx, e);
    }
  }

  @Authorized([
    'customers:view:perform',
    'recycling:SelfService:list',
    'recycling:YardConsole:perform',
  ])
  @Query(() => [HaulingProject])
  async haulingProjects(
    @Ctx() ctx: QueryContext,
    @Arg('filter', () => HaulingProjectFilter) filter: HaulingProjectFilter,
  ): Promise<HaulingProject[]> {
    try {
      const response = await projectService.getAll(ctx, { ...filter });

      return response.data;
    } catch (e) {
      coreErrorHandler(ctx, e);
    }
  }
}
