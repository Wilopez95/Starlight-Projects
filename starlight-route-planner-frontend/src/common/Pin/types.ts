import { MarkerAssetType } from '..';

import { IPinDiskProps } from './';

export interface ISingleServiceMRColors {
  color: string;
  id?: number;
}

export interface IPin {
  type: MarkerAssetType;
  pinDiskProps?: IPinDiskProps;
  showHighlightShadow?: boolean;
  color?: string;
  fullColor?: string;
  width?: number;
  height?: number;
  cursor?: boolean;
  badge?: number;
  singleServiceMRColors?: ISingleServiceMRColors[];
  border?: boolean;
}
