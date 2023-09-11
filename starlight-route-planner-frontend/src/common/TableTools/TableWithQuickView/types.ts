import { BaseEntity } from '@root/stores/base/BaseEntity';
import { BaseStore } from '@root/stores/base/BaseStore';

export type WithQuickViewChildProps<P> = P & {
  condition: boolean;
  store?: BaseStore<BaseEntity>;
  shouldDeselect?: boolean;
  onClose?(): void;
};
