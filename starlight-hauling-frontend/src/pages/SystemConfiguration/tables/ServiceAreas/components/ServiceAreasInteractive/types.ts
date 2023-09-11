import { Dispatch, SetStateAction } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { BBox } from '@turf/helpers';
import { Geometry } from 'geojson';

import { IServiceArea } from '@root/types';
import { IAdministrativeSearchResponse } from '@root/types/responseEntities';

export interface FeatureLike {
  geometry: Geometry;
}

export type SelectBoundaryFunction = (
  administrativeDistrict: IAdministrativeSearchResponse,
) => void;

type MapInteractedFunction = () => void;

export interface IServiceAreaEditor {
  drawRef: React.MutableRefObject<MapboxDraw | undefined>;
  extraneousServiceAreas: IServiceArea[];
  currentServiceArea?: IServiceArea | null;
  minimalReadonly?: boolean;
  registerDrawInteraction?(): void;
  setBBox?: Dispatch<SetStateAction<BBox | undefined>>;
  onBoundarySelect?: SelectBoundaryFunction;
  onMapInteracted?: MapInteractedFunction;
}
