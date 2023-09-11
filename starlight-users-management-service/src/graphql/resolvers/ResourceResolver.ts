import {
  Resolver,
  Mutation,
  Query,
  Ctx,
  Arg,
  Int,
  InputType,
  Field,
  ObjectType,
  Authorized,
} from 'type-graphql';
import { FindConditions, FindManyOptions, In, Raw } from 'typeorm';
import { ForbiddenError } from 'apollo-server-core';

import { ResolverContext } from '../../context';
import { Resource, ResourceType } from '../../entities/Resource';
import { User } from '../../entities/User';

@ObjectType()
export class ListResourcesResult {
  @Field(() => [Resource])
  data!: Resource[];

  @Field()
  total!: number;
}

@InputType()
export class ResourcesFilterInput {
  @Field(() => ResourceType, { nullable: true })
  type?: ResourceType;

  @Field(() => Boolean, { nullable: true })
  configurableOnly?: boolean;
}

@InputType()
export class ResourcesSortInput {
  @Field(() => String)
  field!: keyof Resource & string;

  @Field()
  order!: 'ASC' | 'DESC';
}

type Ordering = {
  [P in keyof Resource]?: 'ASC' | 'DESC' | 1 | -1;
};

@InputType()
export class ResourceInput {
  @Field()
  srn!: string;

  @Field(() => ResourceType)
  type!: ResourceType;

  @Field(() => String, { nullable: true })
  id: string | null = null;

  @Field(() => String, { nullable: true })
  image: string | null = null;

  @Field(() => String, { nullable: true })
  label: string | null = null;

  @Field(() => String, { nullable: true })
  subLabel: string | null = null;

  @Field(() => String, { nullable: true })
  loginUrl: string | null = null;
}

@InputType()
export class ResourceUpdateInput {
  @Field(() => String, { nullable: true })
  id: string | null = null;

  @Field(() => String, { nullable: true })
  image: string | null = null;

  @Field(() => String, { nullable: true })
  label: string | null = null;

  @Field(() => String, { nullable: true })
  subLabel: string | null = null;

  @Field(() => String, { nullable: true })
  loginUrl: string | null = null;

  @Field()
  srn!: string;

  @Field(() => ResourceType)
  type!: ResourceType;
}

@ObjectType()
export class ResourceDeleteResult {
  @Field()
  result!: boolean;
}

@ObjectType({ description: 'Login to a resource, used in lobby for list of login targets' })
export class ResourceLogin {
  @Field(() => String, { nullable: true })
  id: string | null = null;

  @Field(() => String, { nullable: true })
  label: string | null = null;

  @Field(() => String, { nullable: true })
  subLabel: string | null = null;

  @Field(() => String, { nullable: true, description: 'Optional image of a resource' })
  image: string | null = null;

  @Field(() => String, { nullable: true })
  loginUrl: string | null = null;

  @Field(() => Boolean, { nullable: true })
  hasGradingAccess: boolean | null = null;

  @Field(() => Boolean, { nullable: true })
  hasRecyclingAccess: boolean | null = null;

  @Field(() => Boolean, { nullable: true })
  graderHasBUAccess: boolean | null = null;

  @Field()
  resourceType!: string;

  @Field()
  updatedAt!: string;

  @Field()
  tenantName!: string;
}

@Resolver(() => Resource)
export class ResourceResolver {
  @Authorized()
  @Query(() => [ResourceLogin])
  async availableResourceLogins(@Ctx() ctx: ResolverContext): Promise<ResourceLogin[]> {
    const { tenantName, id } = ctx.userInfo ?? {};

    if (!tenantName) {
      return [];
    }

    const resources = await Resource.findByTenantName(tenantName, { configurableOnly: false });

    const user = await User.findOneOrFail(id, {
      relations: ['policies', 'roles', 'roles.policies'],
    });

    return resources
      .filter(resource => user.hasAccessToResource(resource.srn))
      .map(resource => {
        const resourceSrn = resource.srn;

        const resourceLogin = new ResourceLogin();

        resourceLogin.id = resource.id;
        resourceLogin.image = resource.image;
        resourceLogin.label = resource.label;
        resourceLogin.loginUrl = resource.loginUrl;
        resourceLogin.resourceType = resource.type;
        resourceLogin.subLabel = resource.subLabel;
        resourceLogin.tenantName = tenantName;
        resourceLogin.updatedAt = resource.updatedAt.toISOString();

        if (resource.type === ResourceType.RECYCLING) {
          resourceLogin.hasGradingAccess = user.hasAccessToPermission(
            resourceSrn,
            'recycling:GradingInterface',
          );

          if (resourceLogin.hasGradingAccess) {
            resourceLogin.graderHasBUAccess = user.graderHasBUAccess(resourceSrn);
          }

          resourceLogin.hasRecyclingAccess = user.hasAccessToRecyclingResource(resourceSrn);
        }

        return resourceLogin;
      });
  }

  @Authorized()
  @Query(() => Resource, { nullable: true })
  async resource(
    @Ctx() ctx: ResolverContext,
    @Arg('srn', () => String)
    srn: string,
  ): Promise<Resource | undefined> {
    const { tenantName } = ctx.userInfo ?? {};

    const parsedSrn = Resource.parseSrn(srn);

    if (tenantName && parsedSrn[1] !== 'global' && parsedSrn[1] !== tenantName) {
      throw new ForbiddenError('You do not have access to this resource');
    }

    return Resource.findOne({ where: { srn } });
  }

  @Authorized()
  @Query(() => ListResourcesResult)
  async resources(
    @Ctx() ctx: ResolverContext,
    @Arg('sort', () => [ResourcesSortInput], { defaultValue: null })
    sort?: ResourcesSortInput[],
    @Arg('filter', () => ResourcesFilterInput, { defaultValue: {} })
    filter?: ResourcesFilterInput,
    @Arg('offset', () => Int, { defaultValue: 0 }) offset?: number,
    @Arg('limit', () => Int, { defaultValue: 25 }) limit?: number,
  ): Promise<ListResourcesResult> {
    const { tenantName } = ctx.userInfo ?? {};

    const where: FindConditions<Resource> = {};
    const findParams: FindManyOptions<Resource> = {
      skip: offset,
      take: limit,
      where,
    };

    if (tenantName) {
      where.srn = Raw(name => `${name} ~ '^srn:${tenantName}:.*$'`);
    }

    if (filter?.type) {
      where.type = filter.type;
    } else if (filter?.configurableOnly) {
      where.type = In([ResourceType.GLOBAL, ResourceType.HAULING, ResourceType.RECYCLING]);
    }

    if (sort) {
      const order: Ordering = {};
      sort.forEach(sortInput => {
        order[sortInput.field] = sortInput.order;
      });
      findParams.order = order;
    }

    const [resources, total] = await Resource.findAndCount(findParams);

    return {
      data: resources,
      total,
    };
  }

  @Authorized()
  @Mutation(() => Resource)
  async createResource(@Arg('data', () => ResourceInput) data: ResourceInput): Promise<Resource> {
    const existingResource = await Resource.findOne({
      where: {
        srn: data.srn,
      },
    });

    if (existingResource) {
      throw new Error('Already exists');
    }

    const newResource = new Resource();

    Resource.merge(newResource, data);

    await newResource.save();

    return newResource;
  }

  @Authorized()
  @Mutation(() => Resource)
  async updateResource(
    @Arg('data', () => ResourceUpdateInput) data: ResourceUpdateInput,
  ): Promise<Resource> {
    const existingResource = await Resource.findOne({
      where: {
        srn: data.srn,
      },
    });

    if (!existingResource) {
      throw new Error('Not found');
    }

    Resource.merge(existingResource, data);

    await existingResource.save();

    return existingResource;
  }

  @Authorized()
  @Mutation(() => ResourceDeleteResult)
  async deleteResource(@Arg('srn', () => String) srn: string): Promise<ResourceDeleteResult> {
    const existingResource = await Resource.findOne({ where: { srn } });

    if (!existingResource) {
      throw new Error('Not found');
    }

    await existingResource.remove();

    return {
      result: true,
    };
  }
}
