import { Position } from 'geojson';

import { MarkerAssetType } from '@root/common';
import { ISingleServiceMRColors } from '@root/common/Pin/types';

import { MarkerItemTypes } from '..';

export interface IMapMergeData {
  rootMarkerId?: number;
  pinItemId: number;
  jobSiteId: number;
  coordinates: Position;
  jobSiteGroupedItems?: number[];
  masterRouteId?: number;
  assetsType?: MarkerAssetType;
  color: string;
  markerType?: MarkerItemTypes;
  showSequence?: boolean;
  badge?: number;
  singleServiceMRColors?: ISingleServiceMRColors[];
}
