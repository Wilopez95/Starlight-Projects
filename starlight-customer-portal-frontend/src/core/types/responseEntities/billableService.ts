import { IBillableService, IEquipmentItem } from '../entities';
import type { VersionedEntity } from '../helpers';

export interface IResponseBillableService extends IBillableService {
  equipmentItem?: VersionedEntity<IEquipmentItem>;
}
