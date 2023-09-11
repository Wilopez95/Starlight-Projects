import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { toArray } from 'lodash';
import mapboxgl from 'mapbox-gl';

import { accessToken } from '@root/config/mapbox';
import { outlineWidth } from '@root/consts';
import { Regions } from '@root/i18n/config/region';
import { TaxDistrictType } from '@root/types/enums';
import { IAdministrativeSearchResponse } from '@root/types/responseEntities';

import { ReadonlyMode, SnapDirectSelectMode, SnapPolygonMode } from '../modes';
import { DRAW_VERTEX_RADIUS, LAYERS } from '../modes/constants';

mapboxgl.accessToken = accessToken;

interface SetupMapBoxDrawParams {
  map: mapboxgl.Map;
  country: Regions;
  readonly?: boolean;
  forceUpdate(): void;
  drawInteractionHappened(): void;
}

interface MapBoxInitResult {
  draw: MapboxDraw;
}

type SetupMapBoxDrawFunction = (args: SetupMapBoxDrawParams) => MapBoxInitResult;

const tilesetPrefix = process.env.MAPBOX_STARLIGHT_TILESET_PREFIX as string;
const sourceId = 'administrative';

const selected = ['any', ['boolean', ['feature-state', 'selected'], false]];

const applyColorIfNotActive = (color: string) =>
  ['case', selected, color, 'transparent'] as mapboxgl.Expression;

export const initMapBoxDraw: SetupMapBoxDrawFunction = ({
  map,
  country,
  readonly,
  forceUpdate,
  drawInteractionHappened,
}) => {
  const draw = new MapboxDraw({
    keybindings: true,
    displayControlsDefault: false,
    controls: {},
    defaultMode: readonly ? 'readonly' : 'simple_select',
    modes: {
      ...MapboxDraw.modes,
      direct_select: SnapDirectSelectMode,
      snap_polygon: SnapPolygonMode,
      readonly: ReadonlyMode,
    },
    userProperties: true,
    styles: [
      {
        id: LAYERS.Drawing.Id,
        type: 'fill',
        paint: {
          'fill-color': LAYERS.Drawing.Color,
          'fill-outline-color': LAYERS.Drawing.Color,
          'fill-opacity': 0.2,
        },
      },
      {
        id: `${LAYERS.Drawing.Id}-stroke`,
        type: 'line',
        paint: {
          'line-color': LAYERS.Drawing.Color,
          'line-width': outlineWidth,
        },
      },
      {
        id: `${LAYERS.Drawing.Id}-vertex-stroke`,
        type: 'circle',
        filter: [
          'all',
          ['==', 'meta', 'vertex'],
          ['==', '$type', 'Point'],
          ['!=', 'mode', 'static'],
        ],
        paint: {
          'circle-radius': DRAW_VERTEX_RADIUS,
          'circle-color': LAYERS.Drawing.Color,
        },
      },
      {
        id: `${LAYERS.Drawing.Id}-vertex-inside`,
        type: 'circle',
        filter: [
          'all',
          ['==', 'meta', 'vertex'],
          ['==', '$type', 'Point'],
          ['!=', 'mode', 'static'],
        ],
        paint: {
          'circle-radius': 4,
          'circle-color': '#FFFFFF',
        },
      },
      {
        id: `${LAYERS.Drawing.Id}-vertex-midpoint`,
        type: 'circle',
        filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
        paint: {
          'circle-radius': 3,
          'circle-color': LAYERS.Drawing.Color,
        },
      },
    ],
  });

  map.addControl(draw, 'top-left');

  map.addSource(sourceId, {
    type: 'vector',
    url: `${tilesetPrefix}_${country.toLowerCase()}`,
  });

  map.on('draw.modechange', () => {
    forceUpdate();
  });

  let drawMode = draw.getMode();

  // since draw.modechange doesn't fire if no interaction was made, check mode change on render
  map.on('draw.render', () => {
    const currentMode = draw.getMode();

    if (currentMode !== drawMode) {
      drawMode = currentMode;
      forceUpdate();
    }
  });

  map.on('draw.create', () => {
    drawInteractionHappened();
  });

  map.on('draw.update', () => {
    drawInteractionHappened();
  });

  return { draw };
};

export const renderExtraneousServiceAreasLayer = ({
  map,
  data,
  color,
}: {
  map: mapboxgl.Map;
  data: FeatureCollection<Geometry, GeoJsonProperties>;
  color: string;
}) => {
  const source = LAYERS.ServiceAreas.Id;

  const mapSource = map.getSource(source) as mapboxgl.GeoJSONSource;

  if (mapSource) {
    mapSource.setData(data);

    return;
  }

  map.addSource(source, {
    type: 'geojson',
    data,
  });

  map.addLayer(
    {
      id: source,
      source,
      type: 'fill',
      paint: {
        'fill-color': color,
        'fill-outline-color': color,
        'fill-opacity': 0.2,
      },
    },
    LAYERS.Drawing.QueryId,
  );

  map.addLayer(
    {
      id: `${source}-outline`,
      source,
      type: 'line',
      paint: {
        'line-color': color,
        'line-width': outlineWidth,
      },
    },
    LAYERS.Drawing.QueryId,
  );
};

export const renderAdministrativeBoundaryLayer = ({
  map,
  layerType,
  color,
}: {
  map: mapboxgl.Map;
  layerType: TaxDistrictType;
  color: string;
}) => {
  if (map.getLayer(layerType)) {
    return;
  }

  map.addLayer(
    {
      id: `${layerType}`,
      source: sourceId,
      'source-layer': layerType,
      type: 'fill',
      paint: {
        'fill-color': applyColorIfNotActive(color),
        'fill-opacity': 0.2,
      },
    },
    LAYERS.Drawing.QueryId,
  );

  map.addLayer(
    {
      id: `${layerType}-outline`,
      source: sourceId,
      'source-layer': layerType,
      type: 'line',
      paint: {
        'line-color': applyColorIfNotActive(color),
        'line-width': outlineWidth,
      },
    },
    LAYERS.Drawing.QueryId,
  );
};

export const toggleBoundarySelection = ({
  map,
  previousBoundary,
  currentBoundary,
}: {
  map: mapboxgl.Map;
  previousBoundary: IAdministrativeSearchResponse;
  currentBoundary: IAdministrativeSearchResponse;
}) => {
  // Boundary level at some point has happened to become an array of TaxDistrictType
  // So we need to cast it as follows both for previousBoundary and currentBoundary

  if (previousBoundary) {
    (toArray(previousBoundary.level) as TaxDistrictType[]).forEach(l => {
      map.setFeatureState(
        {
          source: sourceId,
          sourceLayer: l,
          id: previousBoundary.id,
        },
        {
          selected: false,
        },
      );
    });
  }

  (toArray(currentBoundary.level) as TaxDistrictType[]).forEach(l => {
    map.setFeatureState(
      {
        source: sourceId,
        sourceLayer: l,
        id: currentBoundary.id,
      },
      {
        selected: true,
      },
    );
  });
};
