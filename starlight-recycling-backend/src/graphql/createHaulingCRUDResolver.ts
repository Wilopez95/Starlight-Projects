import { camelCase, omitBy, isUndefined } from 'lodash';
import { Field, ObjectType, Resolver, Query, Arg, Ctx, Int, Mutation, Maybe } from 'type-graphql';
import { Authorized } from './decorators/Authorized';
import PaginationInput from './types/PaginationInput';
import SortInput from './types/SortInput';
import { QueryContext } from '../types/QueryContext';
import { preparePermissions } from './createCRUDResolver';
import { Context } from '../types/Context';
import { parseFacilitySrn } from '../utils/srn';
import { createToken } from '../utils/serviceToken';
import { ParsedUrlQueryInput } from 'querystring';
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { CORE_SERVICE_API_URL, TRACING_HEADER } from '../config';
import { ApolloError } from 'apollo-server-koa';
import { addRootPermissions } from './helpers';
import { CRUDPermissions } from './types/CRUDPermissions';

export interface EntityBase {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListResponseBasic<T extends EntityBase> {
  data: T[];
}

export type PartialContext = Pick<Context, 'userInfo' | 'resource' | 'reqId'>;

export abstract class HaulingHttpCrudService<
  T extends EntityBase,
  InputT = T,
  UpdateInputT extends EntityBase = T
> {
  abstract path: string;

  async get(
    ctx: PartialContext,
    filter: ParsedUrlQueryInput = {},
    pagination?: PaginationInput,
    sort?: SortInput<T>[],
    authorization?: string,
    tokenPayload?: Record<string, any>,
  ): Promise<ListResponseBasic<T>> {
    const authorizationHeader = await HaulingHttpCrudService.getAuthorizationHeader(
      ctx,
      authorization,
      tokenPayload,
    );

    if (pagination) {
      const { page, perPage } = pagination;
      filter.skip = (page - 1) * perPage;
      filter.limit = perPage;
    }

    if (sort) {
      sort.forEach((sortItem) => {
        filter.sortOrder = sortItem.order.toLowerCase();
        filter.sortBy = sortItem.field;
      });
    }

    // axios sends array param differently then hauling BE expects
    if (Array.isArray(filter.filterByState)) {
      filter.filterByState = filter.filterByState.join(',');
    }

    const response = await axios.get<T[]>(`${CORE_SERVICE_API_URL}/${this.path}`, {
      headers: {
        Authorization: authorizationHeader,
        [TRACING_HEADER]: ctx.reqId,
      },
      params: filter,
      paramsSerializer: (params: ParsedUrlQueryInput) =>
        new URLSearchParams(omitBy((params as unknown) as URLSearchParams, isUndefined)).toString(),
    });

    return {
      data: response.data,
    };
  }

  async getById(
    ctx: PartialContext,
    id: number,
    authorization?: string,
    tokenPayload?: Record<string, any>,
    params?: Record<string, any>,
  ): Promise<Maybe<T>> {
    const authorizationHeader = await HaulingHttpCrudService.getAuthorizationHeader(
      ctx,
      authorization,
      tokenPayload,
    );

    const response = await axios.get<T>(`${CORE_SERVICE_API_URL}/${this.path}/${id}`, {
      headers: {
        Authorization: authorizationHeader,
        [TRACING_HEADER]: ctx.reqId,
      },
      params,
    });

    return response.data;
  }

  async getAll(
    ctx: PartialContext,
    filter: ParsedUrlQueryInput = {},
    sort?: SortInput<T>[],
    authorization?: string,
    tokenPayload?: Record<string, any>,
  ): Promise<ListResponseBasic<T>> {
    const authorizationHeader = await HaulingHttpCrudService.getAuthorizationHeader(
      ctx,
      authorization,
      tokenPayload,
    );

    if (sort) {
      sort.forEach((sortItem) => {
        filter.sortOrder = sortItem.order.toLowerCase();
        filter.sortBy = sortItem.field;
      });
    }

    const response = await axios.get<T[]>(`${CORE_SERVICE_API_URL}/${this.path}/all`, {
      headers: {
        Authorization: authorizationHeader,
        [TRACING_HEADER]: ctx.reqId,
      },
      params: filter,
    });

    return {
      data: response.data,
    };
  }

  async create(
    ctx: PartialContext,
    data: InputT,
    authorization?: string,
    tokenPayload?: Record<string, any>,
  ): Promise<T> {
    const authorizationHeader = await HaulingHttpCrudService.getAuthorizationHeader(
      ctx,
      authorization,
      tokenPayload,
    );

    const response = await axios.post<T>(`${CORE_SERVICE_API_URL}/${this.path}`, data, {
      headers: {
        Authorization: authorizationHeader,
        [TRACING_HEADER]: ctx.reqId,
      },
    });

    return response.data;
  }

  async update(
    ctx: PartialContext,
    data: UpdateInputT,
    authorization?: string,
    tokenPayload?: Record<string, any>,
  ): Promise<T> {
    const authorizationHeader = await HaulingHttpCrudService.getAuthorizationHeader(
      ctx,
      authorization,
      tokenPayload,
    );

    const response = await axios.put<T>(
      `${CORE_SERVICE_API_URL}/${this.path}/${data.id}`,
      {
        ...data,
      },
      {
        headers: {
          Authorization: authorizationHeader,
          [TRACING_HEADER]: ctx.reqId,
        },
      },
    );

    return response.data;
  }

  static async getAuthorizationHeader(
    ctx: PartialContext,
    authorization?: string,
    tokenPayload: Record<string, any> = {},
  ): Promise<string> {
    let authorizationHeader = authorization;

    if (!ctx.userInfo.resource) {
      throw new Error('Failed to get resource from context');
    }

    const { tenantName } = parseFacilitySrn(ctx.userInfo.resource);

    if (!authorizationHeader) {
      const token = await createToken(
        {
          schemaName: tenantName,
          tenantName,
          userId: ctx.userInfo.id,
          ...tokenPayload,
        },
        {
          audience: 'core',
          requestId: ctx.reqId,
        },
      );

      authorizationHeader = `ServiceToken ${token}`;
    }

    return authorizationHeader;
  }

  async makeRequest<Type = T>({
    ctx,
    authorization,
    tokenPayload,
    url,
    ...rest
  }: HaulingCrudServiceMakeRequest): Promise<AxiosResponse<Type>> {
    const authorizationHeader = await HaulingHttpCrudService.getAuthorizationHeader(
      ctx,
      authorization,
      tokenPayload,
    );

    return axios(url || `${CORE_SERVICE_API_URL}/${this.path}`, {
      ...rest,
      headers: {
        Authorization: authorizationHeader,
        [TRACING_HEADER]: ctx.reqId,
      },
    });
  }
}

export interface HaulingCrudServiceMakeRequest extends AxiosRequestConfig {
  ctx: PartialContext;
  authorization?: string;
  tokenPayload?: Record<string, any>;
}

export function createHaulingCRUDResolver<T extends EntityBase, InputT = T>(
  options: {
    service: HaulingHttpCrudService<T, InputT>;
    name: string;
    EntityInput: any;
    FilterInput: any;
    idType?: any;
    EntityUpdateInput?: any;
    permissionsPrefix?: string;
    permissions?: CRUDPermissions;
    rootPermissions?: string[];
    permissionName?: string;

    onBeforeReturnEntity?(entity: T, ctx: QueryContext): Promise<void>;
    onCreate?(newEntity: T, input: InputT, ctx: QueryContext): Promise<void>;
  },
  Entity: any & T,
): any {
  const {
    EntityInput,
    permissionsPrefix,
    rootPermissions = ['recycling:YardConsole:perform'],
    service,
    FilterInput,
    name,
    onBeforeReturnEntity,
    onCreate,
    idType = Int,
    permissionName = name,
  } = options;

  let { EntityUpdateInput } = options;

  if (!EntityUpdateInput) {
    EntityUpdateInput = Entity;
  }

  let permissions = preparePermissions(permissionName, options.permissions, permissionsPrefix);

  @ObjectType(`${name}sResponse`)
  class ListResponse implements ListResponseBasic<T> {
    @Field(() => [Entity])
    data!: T[];
  }
  permissions = addRootPermissions(permissions, rootPermissions);

  @Resolver({ isAbstract: true })
  abstract class AbstractCrudResolver {
    service: HaulingHttpCrudService<T, InputT> = service;

    @Authorized({ roles: permissions?.list, paramsTarget: 'filter' })
    @Query(() => ListResponse, { name: `${camelCase(name)}s` })
    list(
      @Arg('pagination', () => PaginationInput, { defaultValue: { page: 1, perPage: 25 } })
      pagination: PaginationInput,
      @Ctx() ctx: QueryContext,
      @Arg('sort', () => [SortInput], { defaultValue: null })
      sort?: SortInput<T>[],
      @Arg('filter', () => FilterInput, { defaultValue: {} })
      filter?: typeof FilterInput,
    ): Promise<ListResponse> {
      try {
        return service.get(ctx, filter, pagination, sort);
      } catch (e) {
        ctx.log.error(e.response?.data || e, e.message);

        if (!e.response?.data) {
          throw e;
        }

        throw new ApolloError(
          e.response.data.message,
          e.response.data.code,
          e.response.data.details,
        );
      }
    }

    @Authorized({ roles: permissions?.entity, paramsTarget: 'filter' })
    @Query(() => Entity, { name: camelCase(name) })
    async entity(@Arg('id', () => idType) id: number, @Ctx() ctx: QueryContext): Promise<Maybe<T>> {
      try {
        const entity = await service.getById(ctx, id);

        if (entity && onBeforeReturnEntity) {
          await onBeforeReturnEntity(entity, ctx);
        }

        return entity;
      } catch (e) {
        ctx.log.error(e.response?.data || e, e.message);

        if (!e.response?.data) {
          throw e;
        }

        throw new ApolloError(
          e.response.data.message,
          e.response.data.code,
          e.response.data.details,
        );
      }
    }

    @Authorized({ roles: permissions?.createEntity, paramsTarget: 'filter' })
    @Mutation(() => Entity, {
      name: `create${name}`,
      nullable: true,
    })
    async createEntity(
      @Arg('data', () => EntityInput) input: InputT,
      @Ctx() ctx: QueryContext,
    ): Promise<T> {
      try {
        const newEntity = await service.create(ctx, input);

        if (onCreate) {
          await onCreate(newEntity, input, ctx);
        }

        return newEntity;
      } catch (e) {
        ctx.log.error(e.response?.data || e, e.message);

        if (!e.response?.data) {
          throw e;
        }

        throw new ApolloError(
          e.response.data.message,
          e.response.data.code,
          e.response.data.details,
        );
      }
    }

    @Authorized({ roles: permissions?.updateEntity, paramsTarget: 'filter' })
    @Mutation(() => Entity, {
      name: `update${name}`,
      nullable: true,
    })
    async updateEntity(
      @Ctx() ctx: QueryContext,
      @Arg('data', () => EntityUpdateInput) data: T,
    ): Promise<T> {
      try {
        return await service.update(ctx, data);
      } catch (e) {
        ctx.log.error(e.response?.data || e, e.message);

        if (!e.response?.data) {
          throw e;
        }

        throw new ApolloError(
          e.response.data.message,
          e.response.data.code,
          e.response.data.details,
        );
      }
    }
  }

  return AbstractCrudResolver;
}
