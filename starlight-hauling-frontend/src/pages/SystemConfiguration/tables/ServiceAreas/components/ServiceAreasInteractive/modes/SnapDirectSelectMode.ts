import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Map, MapMouseEvent } from 'mapbox-gl';

import { LAYERS } from './constants';
import { getSnappedPosition, getSnappingBBox } from './helpers';
import { IMapboxDrawMode, ISnapPointState, ModeSetupFn, ModeSetupParams } from './types';

const SnapDirectSelectMode: IMapboxDrawMode<ISnapPointState> = {
  ...MapboxDraw.modes.direct_select,
};

SnapDirectSelectMode.onSetup = function (args: ModeSetupParams) {
  const onDirectSelectSetup = MapboxDraw.modes.direct_select
    .onSetup as ModeSetupFn<ISnapPointState>;
  const originalState = onDirectSelectSetup.call(this, args);

  const state: ISnapPointState = {
    currentVertexPosition: 0,
    map: this.map as Map,
    canDragMove: originalState.canDragMove,
    dragMoving: originalState.dragMoving,
    dragMoveLocation: originalState.dragMoveLocation,
    selectedCoordPaths: originalState.selectedCoordPaths,
    feature: originalState.feature,
  };

  return { ...originalState, ...state } as ISnapPointState;
};

SnapDirectSelectMode.onDrag = function (state: ISnapPointState, e: MapMouseEvent) {
  if (!state.canDragMove) {
    return;
  }
  state.dragMoving = true;
  e.originalEvent.stopPropagation();

  const lng = e.lngLat.lng;
  const lat = e.lngLat.lat;

  const bbox = getSnappingBBox(e);

  const features = state.map.queryRenderedFeatures(bbox, {
    layers: [LAYERS.ServiceAreas.QueryId],
  });

  const { position, nearestPoint } = getSnappedPosition(state.map, lng, lat, features);

  const [snapLng, snapLat] = position;

  const delta = {
    lng: snapLng - state.dragMoveLocation.lng,
    lat: snapLat - state.dragMoveLocation.lat,
  };

  if (state.selectedCoordPaths.length > 0) {
    if (nearestPoint) {
      state.feature.updateCoordinate(
        state.selectedCoordPaths[0],
        snapLng as number,
        snapLat as number,
      );
    } else {
      this.dragVertex(state, e, delta as unknown as MapMouseEvent);
    }
  } else {
    this.dragFeature(state, e, delta as unknown as MapMouseEvent);
  }

  state.dragMoveLocation = e.lngLat;
};

export { SnapDirectSelectMode };
