import { BaseEntity } from 'typeorm';
import { QueryContext } from '../types/QueryContext';
import Entities from '../modules/recycling/entities';

export type QueryContextWithEntities = QueryContext & typeof Entities;

export default function <T extends typeof BaseEntity>(Entity: T): (ctx: QueryContext) => T {
  const name = Entity.name;

  return (ctx: QueryContext): T => {
    const contextualizedEntity = ctx[name] as T;

    if ((ctx.userInfo?.resource || ctx.resource) && contextualizedEntity) {
      return contextualizedEntity;
    }

    return Entity;
  };
}
