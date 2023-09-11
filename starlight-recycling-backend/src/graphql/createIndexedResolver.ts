import { Arg, Ctx, Field, Int, ObjectType, Query, Resolver } from 'type-graphql';
import { camelCase } from 'lodash';
import { Authorized } from './decorators/Authorized';
import { SearchBody, SearchBodyInput } from './types/SearchBody';
import { QueryContext } from '../types/QueryContext';
import { BaseEntity } from '../entities';
import { getIndexName } from '../modules/recycling/decorators/ElasticSearch';
import { elasticSearch } from '../services/elasticsearch';
import { SearchResponse, CountResponse } from '../graphql/types/Search';
import { ApolloError } from 'apollo-server-koa';
import { SortOrder } from '../services/billing/graphql/graphql';

interface IndexedResolverOptions<T> {
  serializer?(entity: any): T;
}

export function createIndexedResolver<T extends new (...args: any[]) => BaseEntity, R extends T>(
  Entity: T,
  IndexedEntity: R,
  options?: IndexedResolverOptions<R>,
): any {
  const name = Entity.name;

  @ObjectType(`${name}sIndexedResponse`)
  class ListIndexedResponse {
    @Field(() => [IndexedEntity])
    data!: R[];

    @Field()
    total!: number;
  }

  @Resolver({ isAbstract: true })
  abstract class AbstractIndexedResolver {
    async getIndex(ctx: QueryContext) {
      if (!ctx.userInfo.resource) {
        throw new Error('Context userInfo not found');
      }

      const { metadata } = ctx[Entity.name].getRepository();
      const index = getIndexName(ctx.userInfo.resource, metadata.tableName);

      const exists = await elasticSearch.indexExists(index);

      if (!exists) {
        throw new Error(`ElasticSearch index ${index} not found`);
      }

      return index;
    }

    @Authorized()
    @Query(() => ListIndexedResponse, { name: `${camelCase(name)}sIndexed` })
    async list(
      @Ctx() ctx: QueryContext,
      @Arg('search', () => SearchBodyInput) search: SearchBodyInput,
    ): Promise<ListIndexedResponse> {
      const index = await this.getIndex(ctx);

      const sort = search.sort
        ? search.sort?.map((s) => {
            const [sortObjectPropertyName, sortObjectPropertyValue] = Object.entries(s)[0];

            if (sortObjectPropertyValue && sortObjectPropertyValue?.order) {
              return {
                [sortObjectPropertyName]: {
                  ...sortObjectPropertyValue,
                  missing:
                    sortObjectPropertyValue?.order === SortOrder.Asc.toLowerCase()
                      ? '_first'
                      : '_last',
                },
              };
            } else {
              return {
                [sortObjectPropertyName]: {
                  order: sortObjectPropertyValue,
                  missing:
                    sortObjectPropertyValue === SortOrder.Asc.toLowerCase() ? '_first' : '_last',
                },
              };
            }
          })
        : undefined;

      try {
        const { body } = await elasticSearch.client.search<
          SearchResponse<typeof Entity.prototype>,
          SearchBody
        >({
          index,
          body: { ...search, sort },
        });

        return {
          data: body.hits.hits.map((hit) => {
            const entity = {
              ...hit._source,
              highlight: hit.highlight,
              createdAt: new Date(hit._source.createdAt),
              updatedAt: new Date(hit._source.updatedAt),
            };

            if (options?.serializer) {
              return options.serializer(entity);
            }

            return entity;
          }),
          total: body.hits.total.value,
        };
      } catch (e) {
        ctx.log.error(e, `Failed to fetch ${name}s list`);
        throw new ApolloError(e.message, e.meta.statusCode, e.meta.body);
      }
    }

    @Authorized()
    @Query(() => IndexedEntity, { name: `${camelCase(name)}Indexed` })
    async entity(
      @Ctx() ctx: QueryContext,
      @Arg('id', () => Int) id: number,
    ): Promise<typeof IndexedEntity> {
      const index = await this.getIndex(ctx);

      try {
        const { body } = await elasticSearch.client.search<
          SearchResponse<typeof Entity.prototype>,
          SearchBody
        >({
          index,
          body: {
            query: {
              term: {
                id,
              },
            },
          },
        });

        return body.hits.hits.map((hit) => {
          const entity = {
            ...hit._source,
            highlight: hit.highlight,
            createdAt: new Date(hit._source.createdAt),
            updatedAt: new Date(hit._source.updatedAt),
          };

          if (options?.serializer) {
            return options.serializer(entity);
          }

          return entity;
        })[0];
      } catch (e) {
        ctx.log.error(e, `Failed to fetch ${name} entity`);
        throw new ApolloError(e.message, e.meta.statusCode, e.meta.body);
      }
    }

    @Authorized()
    @Query(() => Int, {
      name: `${camelCase(name)}sIndexedCount`,
      description: `Get ${name} count by filters`,
    })
    async listCount(
      @Ctx() ctx: QueryContext,
      @Arg('search', () => SearchBodyInput) search: SearchBodyInput,
    ): Promise<number> {
      const index = await this.getIndex(ctx);

      try {
        const { body } = await elasticSearch.client.count<CountResponse, SearchBodyInput>({
          index,
          body: search,
        });

        return body.count;
      } catch (e) {
        ctx.log.error(e, `Failed to fetch ${name}s count`);
        throw new ApolloError(e.message, e.meta.statusCode, e.meta.body);
      }
    }
  }

  return AbstractIndexedResolver;
}
