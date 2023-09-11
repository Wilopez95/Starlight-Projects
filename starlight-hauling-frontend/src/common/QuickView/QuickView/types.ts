import { BaseStore } from '@root/stores/base/BaseStore';
import { IEntity } from '@root/types';

import { IBaseQuickView } from '../BaseQuickView/types';
import { QuickViewPaths } from '../types';

interface IQuickView extends Omit<IBaseQuickView, 'onClose' | 'onAfterClose'> {
  store: BaseStore<IEntity>;
  shouldDeselect?: boolean;
  disableAutoOverlay?: boolean;
  onClose?(): void;
  onAfterClose?(): void;
}

export type QuickViewProps = IQuickView & QuickViewPaths;
