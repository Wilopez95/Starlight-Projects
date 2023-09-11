import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { polygon as polygonFeature } from '@turf/helpers';
import { FeatureCollection } from 'geojson';
import { Map, MapMouseEvent } from 'mapbox-gl';

import { DRAW_VERTEX_RADIUS, LAYERS, MODES } from './constants';
import {
  areTwoPointsInVicinity,
  filterRealPolygonalFeatures,
  getSnappedPosition,
  getSnappingBBox,
} from './helpers';
import { IMapboxDrawMode, ISnapPolygonState } from './types';

const SnapPolygonMode: IMapboxDrawMode<ISnapPolygonState> = { ...MapboxDraw.modes.draw_polygon };

SnapPolygonMode.onSetup = function ({ draw }) {
  const polygon = this.newFeature(polygonFeature([]));

  this.addFeature(polygon);
  this.clearSelectedFeatures();

  this.updateUIClasses({ mouse: 'add' });

  const state: ISnapPolygonState = {
    currentVertexPosition: 0,
    map: this.map as Map,
    draw,
    polygon,
    snappedLng: 0,
    snappedLat: 0,
  };

  return state;
};

SnapPolygonMode.onClick = function (state: ISnapPolygonState) {
  const lng = state.snappedLng;
  const lat = state.snappedLat;

  // End the drawing if this click is on the previous position
  if (state.currentVertexPosition > 0) {
    const lastVertex = state.polygon.coordinates[0][state.currentVertexPosition - 1];

    const lastVertexProjection = state.map.project(lastVertex);
    const snappedPointProjection = state.map.project([lng, lat]);

    if (areTwoPointsInVicinity(lastVertexProjection, snappedPointProjection, DRAW_VERTEX_RADIUS)) {
      // force-finish previous polygon drawing
      // rocket science: polygons can have not less than 3 points
      if (state.currentVertexPosition > 2) {
        this.changeMode(MODES.direct_select, { featureId: state.polygon.id });
      }
      // NOTE: next line is only needed in multipolygonal supported mode
      // this.changeMode(MODES.snap_polygon, { draw: state.draw });

      return;
    }
  } else {
    // Single polygon mode: remove all previously drawn feature on first click
    const features = state.draw?.getAll()?.features ?? [];

    if (features.length > 1) {
      const featuresToRemove = features.slice(0, -1);

      const featureIds = featuresToRemove
        .map(featureToRemove => featureToRemove?.id)
        .filter(Boolean) as (number | string)[];

      this.deleteFeature(featureIds, { silent: 'true' });
    }
  }

  state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, lng, lat);

  state.currentVertexPosition++;

  state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, lng, lat);
};

SnapPolygonMode.onMouseMove = function (state: ISnapPolygonState, e: MapMouseEvent) {
  this.updateUIClasses({ mouse: 'add' });

  const lng = e.lngLat.lng;
  const lat = e.lngLat.lat;

  const bbox = getSnappingBBox(e);

  const features = state.map.queryRenderedFeatures(bbox, {
    layers: [LAYERS.ServiceAreas.QueryId],
  });

  const [snapLng, snapLat] = getSnappedPosition(state.map, lng, lat, features).position;

  state.polygon.updateCoordinate(
    `0.${state.currentVertexPosition}`,
    snapLng as number,
    snapLat as number,
  );
  state.snappedLng = snapLng;
  state.snappedLat = snapLat;
};

SnapPolygonMode.onKeyUp = function (state: ISnapPolygonState, e: KeyboardEvent) {
  if (e.which === 13) {
    const features = state.draw ? state.draw.getAll().features : [];
    const polygonalFeatures = filterRealPolygonalFeatures({ features } as FeatureCollection, true);
    const lastFeatureId = polygonalFeatures[polygonalFeatures.length - 1]?.id;

    const mode = lastFeatureId ? MODES.direct_select : MODES.simple_select;

    this.changeMode(mode, { featureId: lastFeatureId });
  }
};

export { SnapPolygonMode };
