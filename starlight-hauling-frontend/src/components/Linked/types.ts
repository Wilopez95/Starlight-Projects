import { BaseEntity } from '@root/stores/base/BaseEntity';

export interface LinkedEntity<T extends BaseEntity> {
  to?: string;
  onClick?(entity: T): void;
  className?: string;
  entity: T;
}
