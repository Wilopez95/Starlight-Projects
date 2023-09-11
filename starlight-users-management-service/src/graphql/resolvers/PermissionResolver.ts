import {
  Resolver,
  Mutation,
  Query,
  Arg,
  Int,
  InputType,
  Field,
  ObjectType,
  Directive,
} from 'type-graphql';

import { FindConditions, FindManyOptions } from 'typeorm';
import { Permission } from '../../entities/Permission';
import { ResourceType } from '../../entities/Resource';

@ObjectType()
export class ListPermissionsResult {
  @Field(() => [Permission])
  data!: Permission[];

  @Field()
  total!: number;
}

@InputType()
export class PermissionsFilterInput {
  @Field(() => ResourceType)
  type!: ResourceType;
}

@InputType()
export class PermissionsSortInput {
  @Field(() => String)
  field!: keyof Permission & string;

  @Field()
  order!: 'ASC' | 'DESC';
}

type OrderType = {
  [P in keyof Permission]?: 'ASC' | 'DESC' | 1 | -1;
};

@InputType()
export class PermissionInput {
  @Field()
  name!: string;

  @Field(() => ResourceType)
  type!: ResourceType;
}

@InputType()
export class PermissionUpdateInput {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field(() => ResourceType)
  type!: ResourceType;
}

@ObjectType()
export class PermissionDeleteResult {
  @Field()
  result!: boolean;
}

/**
 * @deprecated
 */
@Resolver(() => Permission)
@Directive('@deprecated')
export class PermissionResolver {
  @Query(() => ListPermissionsResult)
  async permissions(
    @Arg('sort', () => [PermissionsSortInput], { defaultValue: null })
    sort?: PermissionsSortInput[],
    @Arg('filter', () => PermissionsFilterInput, { defaultValue: {} })
    filter?: PermissionsFilterInput,
    @Arg('offset', () => Int, { defaultValue: 0 }) offset?: number,
    @Arg('limit', () => Int, { defaultValue: 25 }) limit?: number,
  ): Promise<ListPermissionsResult> {
    const where: FindConditions<Permission> = {};
    const findParams: FindManyOptions<Permission> = {
      skip: offset,
      take: limit,
      relations: [],
      where,
    };

    if (filter?.type) {
      where.type = filter.type;
    }

    if (sort) {
      const order: OrderType = {};
      sort.forEach(sortInput => {
        order[sortInput.field] = sortInput.order;
      });
      findParams.order = order;
    }

    const [Permissions, total] = await Permission.findAndCount(findParams);

    return {
      data: Permissions,
      total,
    };
  }

  @Mutation(() => Permission)
  async createPermission(
    @Arg('data', () => PermissionInput) data: PermissionInput,
  ): Promise<Permission> {
    const existingPermission = await Permission.findOne({
      where: {
        name: data.name,
        type: data.type,
      },
    });

    if (existingPermission) {
      throw new Error('Already exists');
    }

    const newPermission = new Permission();

    Permission.merge(newPermission, data);

    await newPermission.save();

    return newPermission;
  }

  @Mutation(() => Permission)
  async updatePermission(
    @Arg('data', () => PermissionUpdateInput) data: PermissionUpdateInput,
  ): Promise<Permission> {
    const existingPermission = await Permission.findOne({
      where: {
        name: data.name,
        type: data.type,
      },
    });

    if (!existingPermission) {
      throw new Error('Not found');
    }

    Permission.merge(existingPermission, data);

    await existingPermission.save();

    return existingPermission;
  }

  @Mutation(() => PermissionDeleteResult)
  async deletePermission(@Arg('id', () => String) id: string): Promise<PermissionDeleteResult> {
    const existingPermission = await Permission.findOne(id);

    if (!existingPermission) {
      throw new Error('Not found');
    }

    await existingPermission.remove();

    return {
      result: true,
    };
  }
}
