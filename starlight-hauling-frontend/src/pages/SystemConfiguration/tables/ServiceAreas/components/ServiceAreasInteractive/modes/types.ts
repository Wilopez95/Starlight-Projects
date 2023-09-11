import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Feature } from 'geojson';
import { LngLat, LngLatLike, Map, MapMouseEvent } from 'mapbox-gl';

import { ModeType } from './constants';

export type UpdateCoordinatesFunction = (vertex: string, lng: number, lat: number) => void;

export interface MapBoxDrawFeature {
  id: number | string;
  coordinates: LngLatLike[][];
  updateCoordinate: UpdateCoordinatesFunction;
}

export interface ISnapPointState {
  currentVertexPosition: number;
  map: Map;
  feature: MapBoxDrawFeature;
  canDragMove: boolean;
  dragMoving: boolean;
  dragMoveLocation: LngLat;
  selectedCoordPaths: string[];
}

export interface ISnapPolygonState {
  currentVertexPosition: number;
  map: Map;
  polygon: MapBoxDrawFeature;
  snappedLng: number;
  snappedLat: number;
  draw?: MapboxDraw;
}

type ModeNewFeatureFn = (feature: Feature) => MapBoxDrawFeature;
type ModeFeatureOperation = (args: MapBoxDrawFeature) => void;
type ModeDeleteFeature = (ids: Array<number | string>, params?: Record<string, string>) => void;
type ModeAnyOp<T = string> = (args?: T) => void;

export interface ModeSetupParams {
  draw?: MapboxDraw;
  featureId?: number | string;
}

export type ModeSetupFn<T> = (args: ModeSetupParams) => T;
type ModeBaseHandler<T, E> = (state: T, e: E) => void;
type ModeInternalHandler<T, E, R = MapMouseEvent> = (state: T, e: E, rest?: R) => void;
type ModeChangeHandler = (mode: ModeType, params?: ModeSetupParams) => void;
type DisplayFeatureFn<T> = (
  state: T,
  geojson: Record<string, string>,
  display: (args: Record<string, string>) => void,
) => void;

export interface IMinimalMapboxDrawMode<T> {
  map: Map | null;

  onSetup: ModeSetupFn<T>;
  toDisplayFeatures: DisplayFeatureFn<T>;
}

export interface IMapboxDrawMode<T> extends IMinimalMapboxDrawMode<T> {
  onClick: ModeBaseHandler<T, MapMouseEvent>;
  onMouseMove: ModeBaseHandler<T, MapMouseEvent>;
  onKeyUp: ModeBaseHandler<T, KeyboardEvent>;
  onDrag: ModeBaseHandler<T, MapMouseEvent>;

  newFeature: ModeNewFeatureFn;
  addFeature: ModeFeatureOperation;
  clearSelectedFeatures: ModeAnyOp;
  updateUIClasses: ModeAnyOp<Record<'mouse', string>>;
  deleteFeature: ModeDeleteFeature;
  changeMode: ModeChangeHandler;
  dragVertex: ModeInternalHandler<T, MapMouseEvent>;
  dragFeature: ModeInternalHandler<T, MapMouseEvent>;
}
