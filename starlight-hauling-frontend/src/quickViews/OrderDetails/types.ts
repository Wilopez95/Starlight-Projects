import { ICustomQuickView } from '@root/common';

export interface IOrderDetailsComponent {
  shouldRemoveOrderFromStore: boolean;
}

export type OrderDetailsQuickViewProps = ICustomQuickView & IOrderDetailsComponent;
