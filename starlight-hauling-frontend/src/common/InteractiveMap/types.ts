import { type ReactElement, type SVGProps } from 'react';
import { IBoxLayout } from '@starlightpro/shared-components';
import { type FeatureCollection, type Point } from 'geojson';

import { type Regions } from '@root/i18n/config/region';
import { Units } from '@root/i18n/config/units';

import type Boundaries from './Boundaries';
import type Marker from './Marker';

export type BoundariesType = 'primary' | 'secondary' | 'municipal';

// It is unsafe (and does not really make sense) to display two boundaries at once
// TODO add development-only invariant checks to InteractiveMap
export type MapChild =
  | ReactElement<IMarker, typeof Marker>
  | ReactElement<IBoundaries, typeof Boundaries>;

export interface IInteractiveMapHandle {
  fitToMarkers(): boolean;
}

export type MapStyleType = 'default' | 'dark';
export interface IInteractiveMap extends IBoxLayout {
  children: React.ReactNode;
  zoom?: number;
  initialFit?: number[];
  mapStyle?: MapStyleType;
}

export interface IMarker {
  initialPosition: Point;
  text?: string;
  draggable?: boolean;
  selected?: boolean;
  color?: string;
  onDragEnd?(position: Point): void;
  onClick?(): void;
}

export interface IMarkerHandle {
  flyToThis(): boolean;
  reset(): boolean;
}

export interface IBoundaries {
  type: BoundariesType;
  country: Regions;
  onZoneClick?(zone: FeatureCollection): void;
  selectedZone?: string;
}

export interface IStyledMarker extends SVGProps<HTMLOrSVGElement> {
  $selected?: boolean;
  $clickable?: boolean;
  $color?: string;
}

export interface IPolygon {
  coordinates: GeoJSON.Position[][];
}

export interface IRadius {
  coordinates: GeoJSON.Position;
  radius: number;
  units: Units;
}
