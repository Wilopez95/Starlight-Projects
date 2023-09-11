import { BaseEntity } from '@root/core/stores/base/BaseEntity';

export interface IBaseRow<T extends BaseEntity> {
  item: T;
  selectedItem: T | null;
  onSelect: (item: T) => void;
}
