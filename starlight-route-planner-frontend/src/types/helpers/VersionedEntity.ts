import { IEntity } from '../entities';

export type VersionedEntity<T extends IEntity> = T & { originalId: number };
