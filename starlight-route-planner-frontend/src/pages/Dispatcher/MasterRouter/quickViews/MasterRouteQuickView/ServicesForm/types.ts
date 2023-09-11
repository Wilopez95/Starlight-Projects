import { IHaulingServiceItem, IMapMergeData } from '@root/types';

export interface IServiceItemsToSet extends IHaulingServiceItem {
  rootMarkerId: number;
  sequence: number;
  options?: Partial<IMapMergeData>;
}
