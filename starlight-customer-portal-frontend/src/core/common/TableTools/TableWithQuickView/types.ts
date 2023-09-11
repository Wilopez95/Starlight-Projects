import type { BaseEntity } from '@root/core/stores/base/BaseEntity';
import type { BaseStore } from '@root/core/stores/base/BaseStore';

export type WithQuickViewChildProps<P> = P & {
  condition: boolean;
  store?: BaseStore<BaseEntity>;
  shouldDeselect?: boolean;
  onClose?(): void;
};
