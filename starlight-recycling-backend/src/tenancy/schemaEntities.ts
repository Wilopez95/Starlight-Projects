import { BaseEntity } from 'typeorm';

export type EntitiesMap = { [key: string]: typeof BaseEntity };

export const schemaEntities: { [key: string]: EntitiesMap } = {};
