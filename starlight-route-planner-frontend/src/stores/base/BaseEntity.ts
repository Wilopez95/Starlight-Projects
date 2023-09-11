import { parseDate } from '@root/helpers';
import { IEntity, JsonConversions } from '@root/types';

export class BaseEntity implements IEntity {
  id: number;
  createdAt: Date | string;
  updatedAt: Date | string;

  constructor(entity: JsonConversions<IEntity>) {
    this.id = entity.id;

    this.createdAt = parseDate(entity.createdAt);
    this.updatedAt = parseDate(entity.updatedAt);
  }

  toString() {
    return this.id.toString();
  }
}
