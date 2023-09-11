import { camelCase, defaults, matches, isObject } from 'lodash';
import {
  Field,
  ObjectType,
  Resolver,
  Query,
  Arg,
  Mutation,
  Int,
  Ctx,
  // Authorized,
} from 'type-graphql';
import {
  FindManyOptions,
  FindOneOptions,
  FindConditions,
  Brackets,
  WhereExpression,
  ObjectLiteral,
  SaveOptions,
} from 'typeorm';
import { Authorized } from './decorators/Authorized';
import PaginationInput from './types/PaginationInput';
import SortInput from './types/SortInput';
import { QueryContext } from '../types/QueryContext';
import BaseEntity from '../entities/BaseEntity';
import { forOwn, isArray, forEach } from 'lodash';
import AuditEntityAction from '../entities/AuditEntityAction';
import BaseEntityWithAudit from '../entities/BaseEntityWithAudit';
import BaseEntityWithVersion from '../entities/BaseEntityWithVersion';
import { addRootPermissions } from './helpers';
import { CRUDPermissions } from './types/CRUDPermissions';

/* eslint @typescript-eslint/no-explicit-any: 0 */

export interface EntitySaveOptions extends SaveOptions {
  skipSave?: boolean;
}

export interface CreateCRUDResolverOptions<T extends BaseEntity> {
  EntityInput: any;
  EntityUpdateInput?: any;
  FilterInput: any;
  modifyListParamsWithFilters?(
    filter: unknown,
    params: FindManyOptions<T> & { where: FindConditions<T> },
    ctx: QueryContext,
  ): Promise<void> | void;
  onCreate?(
    newEntity: T,
    input: unknown,
    ctx: QueryContext,
    save: (options?: EntitySaveOptions) => Promise<void>,
  ): Promise<void>;
  onUpdate?(
    entity: T,
    input: unknown,
    ctx: QueryContext,
    save: (options?: EntitySaveOptions) => Promise<void>,
    prevData: any,
  ): Promise<void>;
  onDelete?(criteria: FindConditions<T>, ctx: QueryContext): Promise<void>;
  onRecover?(criteria: FindConditions<T>, ctx: QueryContext): Promise<void>;
  onBeforeReturnEntity?(entity: T, ctx: QueryContext): Promise<void>;
  idType: any;
  relations?: string[];
  /**
   permissionsPrefix will be ignored for specified permissions in the permissions option
   */
  permissionsPrefix?: string;
  permissions?: CRUDPermissions;
  rootPermissions?: string[];
  softDelete?: boolean;
  useFilterForId?: boolean;
  withOrderByRelationFields?: boolean;
  /**
   * Flag to specify if Entity has elastic search index
   * */
  indexed?: boolean;
}

export const preparePermissions = (
  entityName: string,
  inputPermissions?: CRUDPermissions,
  permissionsPrefix = '',
): CRUDPermissions => {
  return defaults(inputPermissions, {
    list: `${permissionsPrefix ? permissionsPrefix + ':' : ''}${entityName}:list`,
    entity: `${permissionsPrefix ? permissionsPrefix + ':' : ''}${entityName}:view`,
    entitiesByIds: `${permissionsPrefix ? permissionsPrefix + ':' : ''}${entityName}:list`,
    createEntity: `${permissionsPrefix ? permissionsPrefix + ':' : ''}${entityName}:create`,
    deleteEntity: `${permissionsPrefix ? permissionsPrefix + ':' : ''}${entityName}:delete`,
    updateEntity: `${permissionsPrefix ? permissionsPrefix + ':' : ''}${entityName}:update`,
  });
};

export function createCRUDResolver<
  T extends BaseEntity,
  E extends typeof BaseEntity = typeof BaseEntity
>(options: CreateCRUDResolverOptions<T>, Entity: E): any {
  const {
    EntityInput,
    FilterInput,
    onCreate,
    onUpdate,
    onDelete,
    onRecover,
    onBeforeReturnEntity,
    modifyListParamsWithFilters,
    idType = Int,
    relations = [],
    permissionsPrefix,
    rootPermissions = ['recycling:YardConsole:perform'],
    softDelete,
    useFilterForId,
    withOrderByRelationFields,
  } = options;
  const name = Entity.name;
  let { EntityUpdateInput, permissions } = options;

  const getContextualizedEntity = (ctx: QueryContext): E => {
    const contextualizedEntity = (ctx as any)[name] as E;

    if (ctx.userInfo?.resource && contextualizedEntity) {
      return contextualizedEntity;
    }

    return Entity;
  };

  if (!EntityUpdateInput) {
    EntityUpdateInput = EntityInput;
  }

  permissions = preparePermissions(name, permissions, permissionsPrefix);

  @ObjectType(`${name}DeleteResult`)
  class DeleteResult {
    @Field()
    result!: boolean;
  }

  @ObjectType(`${name}sResponse`)
  class ListResponse {
    @Field(() => [Entity])
    data!: T[];

    @Field()
    total!: number;
  }

  type orderType = {
    [P in keyof T]?: 'ASC' | 'DESC' | 1 | -1;
  };

  abstract class AllEntities {
    async list(
      pagination: PaginationInput,
      ctx: QueryContext,
      sort?: SortInput<T>[],
      filter?: typeof FilterInput,
    ): Promise<ListResponse> {
      const findParams: FindManyOptions<T> = {
        skip: (pagination.page - 1) * pagination.perPage,
        take: pagination.perPage,
        relations,
        where: {},
      };

      if (sort) {
        const order: orderType = {};
        sort.forEach((sortInput) => {
          order[sortInput.field as keyof T] = sortInput.order;
        });
        findParams.order = order;
      }

      if (filter && modifyListParamsWithFilters) {
        const p = modifyListParamsWithFilters(filter, findParams as any, ctx);

        if (p && p.then) {
          await p;
        }
      }

      const ContextualizedEntity = getContextualizedEntity(ctx);

      if (pagination.perPage === -1) {
        findParams.skip = 0;
        findParams.take = await ContextualizedEntity.count({ relations, where: findParams.where });

        // eslint-disable-next-line
        // @ts-ignore
        const data = await ContextualizedEntity.find(findParams);

        // eslint-disable-next-line
        // @ts-ignore
        return { data, total: findParams.take };
      } else {
        // eslint-disable-next-line
        // @ts-ignore
        const [items, total] = await ContextualizedEntity.findAndCount(findParams);

        return {
          // eslint-disable-next-line
          // @ts-ignore
          data: items || [],
          total: total,
        };
      }
    }
  }

  abstract class AllEntitiesOrderByRelationFields {
    async list(
      pagination: PaginationInput,
      ctx: QueryContext,
      sort?: SortInput<T>[],
      filter?: typeof FilterInput,
    ): Promise<ListResponse> {
      const findParams: FindManyOptions<T> = {
        skip: (pagination.page - 1) * pagination.perPage,
        take: pagination.perPage,
        relations,
        where: {},
      };

      if (filter && modifyListParamsWithFilters) {
        const p = modifyListParamsWithFilters(filter, findParams as any, ctx);

        if (p && p.then) {
          await p;
        }
      }

      const ContextualizedEntity = getContextualizedEntity(ctx);
      const queryBuilder = ContextualizedEntity.createQueryBuilder(name);

      if (relations.length) {
        relations.forEach((relation) =>
          queryBuilder.leftJoinAndSelect(`${name}.${relation}`, relation),
        );
      }

      const { where } = findParams;

      const buildWhereConditions = (
        qb: WhereExpression,
        conditions: FindConditions<T> | ObjectLiteral,
      ): void => {
        forOwn(conditions, (value, key: string) => {
          const relationIndex = relations.indexOf(key);

          if (relationIndex > -1) {
            const relation = relations[relationIndex];

            if (typeof value === 'object') {
              forOwn(value, (relationCondition, relationConditionKey) => {
                const prop = `${relation}.${relationConditionKey}`;
                qb.andWhere(`${prop} = :${prop}`, {
                  [prop]: relationCondition,
                });
              });
            }
          } else {
            const prop = `${name}.${key}`;
            qb.andWhere(`${prop} = :${prop}`, { [prop]: value });
          }
        });
      };

      if (isArray(where)) {
        forEach(where, (conditions: ObjectLiteral) => {
          queryBuilder.orWhere(
            new Brackets((qb) => {
              buildWhereConditions(qb, conditions);
            }),
          );
        });
      } else {
        buildWhereConditions(queryBuilder, where as ObjectLiteral);
      }

      if (sort) {
        const order: any = {};
        sort.forEach((sortInput) => {
          const [relationName] = sortInput.field.split('.');

          if (relations.indexOf(relationName) !== -1) {
            order[sortInput.field] = sortInput.order;
          } else {
            order[`${name}.${relationName}`] = sortInput.order;
          }
        });
        queryBuilder.orderBy(order);
      }

      if (pagination.perPage !== -1) {
        queryBuilder.skip(findParams.skip);
        queryBuilder.take(findParams.take);
      }

      const [items, total] = await queryBuilder.getManyAndCount();

      return {
        // eslint-disable-next-line
        // @ts-ignore
        data: items || [],
        total: total,
      };
    }
  }

  let BaseClass = class extends AllEntities {};

  if (withOrderByRelationFields) {
    BaseClass = class extends AllEntitiesOrderByRelationFields {};
  }
  permissions = addRootPermissions(permissions, rootPermissions);

  @Resolver({ isAbstract: true })
  abstract class AbstractCrudResolver extends BaseClass {
    @Authorized({ roles: permissions?.list, paramsTarget: 'filter' })
    @Query(() => ListResponse, { name: `${camelCase(name)}s` })
    list(
      @Arg('pagination', () => PaginationInput, { defaultValue: { page: 1, perPage: 10 } })
      pagination: PaginationInput,
      @Ctx() ctx: QueryContext,
      @Arg('sort', () => [SortInput], { defaultValue: null })
      sort?: SortInput<T>[],
      @Arg('filter', () => FilterInput, { defaultValue: {} })
      filter?: typeof FilterInput,
    ): Promise<ListResponse> {
      return super.list(pagination, ctx, sort, filter);
    }

    @Authorized({ roles: permissions?.entity, paramsTarget: 'filter' })
    @Query(() => Entity, { name: camelCase(name) })
    async entity(
      @Arg('id', () => idType) id: number,
      @Ctx() ctx: QueryContext,
      @Arg('filter', () => FilterInput, { defaultValue: {} })
      filter?: typeof FilterInput,
    ): Promise<T | null> {
      const ContextualizedEntity = getContextualizedEntity(ctx);

      const findParams: FindOneOptions<T> = {
        relations,
        where: {},
      };

      if (useFilterForId) {
        // eslint-disable-next-line
        // @ts-ignore
        findParams.where.id = id;
      }

      if (filter && modifyListParamsWithFilters) {
        const p = modifyListParamsWithFilters(filter, findParams as any, ctx);

        if (p && p.then) {
          await p;
        }
      }

      let entity: T;

      if (useFilterForId) {
        // eslint-disable-next-line
        // @ts-ignore
        entity = await ContextualizedEntity.findOneOrFail(findParams as FindOneOptions<BaseEntity>);
      } else {
        // eslint-disable-next-line
        // @ts-ignore
        entity = await ContextualizedEntity.findOneOrFail(
          id,
          findParams as FindOneOptions<BaseEntity>,
        );
      }

      if (onBeforeReturnEntity) {
        await onBeforeReturnEntity(entity, ctx);
      }

      return entity;
    }

    @Authorized({ roles: permissions?.entitiesByIds, paramsTarget: 'filter' })
    @Query(() => [Entity], { name: `${camelCase(name)}sByIds` })
    async entitiesByIds(
      @Arg('ids', () => [idType]) ids: number[],
      @Ctx() ctx: QueryContext,
      @Arg('filter', () => FilterInput, { defaultValue: {} })
      filter?: typeof FilterInput,
    ): Promise<T[] | null> {
      const ContextualizedEntity = getContextualizedEntity(ctx);
      const findParams: FindOneOptions<T> = {
        relations,
        where: {},
      };

      if (filter && modifyListParamsWithFilters) {
        const p = modifyListParamsWithFilters(filter, findParams as any, ctx);

        if (p && p.then) {
          await p;
        }
      }

      const entities = await ContextualizedEntity.findByIds(
        ids,
        findParams as FindOneOptions<BaseEntity>,
      );

      // eslint-disable-next-line
      // @ts-ignore
      return entities || null;
    }

    @Authorized({ roles: permissions?.createEntity, paramsTarget: 'filter' })
    @Mutation(() => Entity, {
      name: `create${name}`,
      nullable: true,
    })
    async createEntity(
      @Arg('data', () => EntityInput) input: typeof EntityInput,
      @Ctx() ctx: QueryContext,
      @Arg('filter', () => FilterInput, { defaultValue: {} })
      filter?: typeof FilterInput,
    ): Promise<T | null> {
      const ContextualizedEntity = getContextualizedEntity(ctx);
      const newEntity = new ContextualizedEntity();
      let saved = false;
      const findParams: FindOneOptions<T> = {
        relations,
        where: {},
      };

      newEntity.useContext(ctx);

      if (newEntity instanceof BaseEntityWithVersion) {
        newEntity.current = true;
      }

      if (filter && modifyListParamsWithFilters) {
        const p = modifyListParamsWithFilters(filter, findParams as any, ctx);

        if (p && p.then) {
          await p;
        }
      }

      const save = async (options?: EntitySaveOptions): Promise<void> => {
        if (filter && !matches(findParams.where)(newEntity)) {
          return;
        }

        if (!options?.skipSave) {
          await newEntity.save(options);
        }

        saved = true;
      };

      Object.keys(input).forEach((key) => {
        try {
          // eslint-disable-next-line
          // @ts-ignore
          newEntity[key] = input[key];
        } catch (e) {
          if (
            e instanceof TypeError &&
            e.message.indexOf('a getter') > 0 &&
            e.message.indexOf('set property') > 0
          ) {
            // ignore
          } else {
            throw e;
          }
        }
      });

      if (onCreate) {
        await onCreate(newEntity as T, input, ctx, save);
      }

      if (!saved) {
        await save();
      }

      // eslint-disable-next-line
      // @ts-ignore
      return newEntity;
    }

    @Authorized({ roles: permissions?.deleteEntity, paramsTarget: 'filter' })
    @Mutation(() => DeleteResult, {
      name: `delete${name}`,
    })
    async deleteEntity(
      @Arg('id', () => idType) id: string,
      @Ctx() ctx: QueryContext,
      @Arg('filter', () => FilterInput, { defaultValue: {} })
      filter?: typeof FilterInput,
    ): Promise<DeleteResult> {
      const findParams: FindOneOptions<T> = {
        relations,
        where: {},
      };
      const ContextualizedEntity = getContextualizedEntity(ctx);

      if (useFilterForId) {
        // eslint-disable-next-line
        // @ts-ignore
        findParams.where.id = id;
      }

      if (filter && modifyListParamsWithFilters) {
        const p = modifyListParamsWithFilters(filter, findParams as any, ctx);

        if (p && p.then) {
          await p;
        }
      }

      const deleteParams: any = {
        id,
      };

      if (findParams.where && isObject(findParams.where)) {
        Object.assign(deleteParams, findParams.where);
      }

      const criteria = {
        ...deleteParams,
      };

      if (onDelete) {
        await onDelete(criteria, ctx);
      }

      const entity = await ContextualizedEntity.findOne(criteria);

      if (!entity) {
        throw new Error('Entity not found');
      }

      entity.useContext(ctx);

      if (softDelete) {
        await entity.softRemove();
      } else {
        await entity.remove();
      }

      return {
        result: true,
      };
    }

    @Authorized({ roles: permissions?.updateEntity, paramsTarget: 'filter' })
    @Mutation(() => Entity, {
      name: `update${name}`,
    })
    async updateEntity(
      @Arg('data', () => EntityUpdateInput) input: typeof EntityUpdateInput,
      @Ctx() ctx: QueryContext,
      @Arg('filter', () => FilterInput, { defaultValue: {} })
      filter?: typeof FilterInput,
    ): Promise<T> {
      const ContextualizedEntity = getContextualizedEntity(ctx);
      const findParams: FindOneOptions<T> = {
        relations,
        where: {},
      };

      if (useFilterForId) {
        // eslint-disable-next-line
        // @ts-ignore
        findParams.where.id = input.id;
      }

      if (filter && modifyListParamsWithFilters) {
        const p = modifyListParamsWithFilters(filter, findParams as any, ctx);

        if (p && p.then) {
          await p;
        }
      }

      let entity: BaseEntity | undefined;

      if (useFilterForId) {
        entity = await ContextualizedEntity.findOne(findParams as FindOneOptions<BaseEntity>);
      } else {
        entity = await ContextualizedEntity.findOne(
          input.id,
          findParams as FindOneOptions<BaseEntity>,
        );
      }

      if (!entity) {
        throw new Error('Not Found');
      }

      entity.useContext(ctx);

      const prevData = { ...entity };

      if (entity instanceof BaseEntityWithAudit) {
        entity.action = AuditEntityAction.UPDATE;
        entity.reason = 'update via mutation';
      }

      let saved = false;

      Object.keys(input).forEach((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(entity, key);

        if (descriptor?.writable) {
          // eslint-disable-next-line
          // @ts-ignore
          entity[key] = input[key];
        }
      });

      const save = async (options?: EntitySaveOptions): Promise<void> => {
        if (!options?.skipSave) {
          await entity?.save(options);
        }

        saved = true;
      };

      if (onUpdate) {
        await onUpdate(entity as T, input, ctx, save, prevData);
      }

      if (!saved) {
        await save();
      }

      // eslint-disable-next-line
      // @ts-ignore
      return entity;
    }

    @Authorized({ roles: permissions?.createEntity, paramsTarget: 'filter' })
    @Mutation(() => Entity, {
      name: `recover${name}`,
    })
    async recoverEntity(
      @Ctx() ctx: QueryContext,
      @Arg('id', () => idType, { nullable: true }) id?: string,
      @Arg('filter', () => FilterInput, { defaultValue: {} })
      filter?: typeof FilterInput,
    ) {
      if (!softDelete) {
        throw new Error(`Soft delete is not supported for ${name}`);
      }

      const findParams: FindOneOptions<T> = {
        relations,
        where: {},
      };
      const ContextualizedEntity = getContextualizedEntity(ctx);

      if (useFilterForId && id) {
        // eslint-disable-next-line
        // @ts-ignore
        findParams.where.id = id;
      }

      if (filter && modifyListParamsWithFilters) {
        const p = modifyListParamsWithFilters(filter, findParams as any, ctx);

        if (p && p.then) {
          await p;
        }
      }

      const recoverParams: any = {};

      if (id) {
        recoverParams.id = id;
      }

      if (findParams.where && isObject(findParams.where)) {
        Object.assign(recoverParams, findParams.where);
      }

      const criteria = {
        ...recoverParams,
      };

      if (onRecover) {
        await onRecover(criteria, ctx);
      }
      delete criteria.deleteDate;

      const entity = await ContextualizedEntity.findOne(criteria, { withDeleted: true });

      if (!entity) {
        throw new Error('Entity not found');
      }

      entity.useContext(ctx);

      await entity.recover();

      return entity;
    }
  }

  return AbstractCrudResolver;
}
