import { parseDate } from '@root/core/helpers';
import { IEntity, JsonConversions } from '@root/core/types';

export class BaseEntity implements IEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(entity: JsonConversions<IEntity>) {
    this.id = entity.id;

    this.createdAt = parseDate(entity.createdAt);
    this.updatedAt = parseDate(entity.updatedAt);
  }

  toString() {
    return this.id.toString();
  }
}
