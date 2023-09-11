import { EntityMetadata } from 'typeorm';

import { EventListenerType, EventListenerTypes } from '../../../services/observableEntity';
import BaseEntityWithUserInfo from '../../../entities/BaseEntityWithUserInfo';
import { ObservableEntity } from '../../../decorators/Observable';

/* eslint-disable @typescript-eslint/no-explicit-any */

export function getPrimaryId<T extends BaseEntityWithUserInfo>(
  metadata: EntityMetadata,
  entity: T,
): any {
  const primaryColumns = metadata.primaryColumns;

  if (primaryColumns.length === 0) {
    return;
  }

  if (primaryColumns.length === 1) {
    return entity[primaryColumns[0].propertyName as keyof T];
  }

  return primaryColumns.map((column) => entity[column.propertyName as keyof T]).join('_');
}

export function getIndexName(resource: string, tableName: string): string {
  return `${resource.replace(/:/g, '.')}.${tableName}`;
}

const events: EventListenerType[] = [
  EventListenerTypes.AFTER_INSERT,
  EventListenerTypes.AFTER_UPDATE,
  EventListenerTypes.BEFORE_REMOVE,
];

export type PropertyMapping = {
  type: string;
  index?: boolean;
  fielddata?: boolean;
  fields?: any;
  analyzer?: any;
  search_analyzer?: any;
};

export type EntityFieldMapping<T> = {
  [key in keyof T]?: PropertyMapping | EntityFieldMapping<any>;
};

export type ElasticSearchEntityMappings<T> = {
  properties: EntityFieldMapping<T>;
};

export type ElasticSearchIndexSettings = {
  index?: {
    max_ngram_diff?: number;
    analysis?: {
      analyzer: any;
      tokenizer: Record<string, any>;
      char_filter?: Record<string, any>;
      filter?: Record<string, any>;
    };
  };
};

export type CreateIndexBody<T> = {
  mappings?: ElasticSearchEntityMappings<T>;
  settings?: ElasticSearchIndexSettings;
};

export type ElasticSearchDecoratorConfig<T extends BaseEntityWithUserInfo> = {
  body?: CreateIndexBody<T>;
  includeRelations?: string[];
};

type ElasticEntitiesTuple = [
  target: any,
  indexedEntity: any,
  config?: ElasticSearchDecoratorConfig<any>,
];

export const elasticSearchEntities: Record<string, ElasticEntitiesTuple> = {};
export const getEntityConfigByName = (
  name: string,
): ElasticSearchDecoratorConfig<any> | undefined => {
  if (!elasticSearchEntities[name]) {
    return;
  }

  return elasticSearchEntities[name][2];
};

export function ElasticSearch<T extends BaseEntityWithUserInfo>(
  config?: ElasticSearchDecoratorConfig<T>,
): ClassDecorator {
  return function ElasticSearchDecorator(target): void {
    const Base = Object.getPrototypeOf(target);
    elasticSearchEntities[Base.name] = [Base, target, config];
    ObservableEntity({ events: events })(Base);
  };
}
