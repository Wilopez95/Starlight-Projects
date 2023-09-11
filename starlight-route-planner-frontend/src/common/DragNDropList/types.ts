import { IMapMergeData, MarkerItemTypes } from '@root/types';

export interface IDragNDropList {
  title: string;
  acceptType: MarkerItemTypes;
  onItemDrop(item: IDropResult): void;
  error?: string;
}

export interface IDropResult extends IMapMergeData {
  type: MarkerItemTypes;
}
