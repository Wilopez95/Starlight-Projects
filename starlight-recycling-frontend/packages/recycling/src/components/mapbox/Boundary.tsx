import React, { useContext, useEffect } from 'react';
import bbox from '@turf/bbox';
import mapboxgl from 'mapbox-gl';

import { MAPBOX_ADMINISTRATIVE_TILESET_ID } from '../../constants';
import { MapContext } from './MapContext';
import { TaxDistrictType } from './types';

export interface BoundariesProps {
  type: TaxDistrictType;
  zoneId?: string | number;
  flyToOnMount?: boolean;
  featureCoordinates?: [number, number];
}

const sourceId = MAPBOX_ADMINISTRATIVE_TILESET_ID;

const Boundary: React.FC<BoundariesProps> = ({
  type,
  zoneId,
  flyToOnMount,
  featureCoordinates,
}) => {
  const { map } = useContext(MapContext);

  useEffect(() => {
    if (!map?.loaded()) {
      return;
    }

    const doIt = () => {
      map.setFeatureState(
        {
          source: sourceId,
          sourceLayer: type,
          id: zoneId,
        },
        { selected: true },
      );

      if (flyToOnMount) {
        const features = map.querySourceFeatures(sourceId, {
          sourceLayer: type,
          filter: ['==', ['id'], zoneId],
        });

        if (features.length > 0) {
          const box = bbox({
            type: 'FeatureCollection',
            features,
          });

          map.fitBounds(
            [
              [box[0], box[1]],
              [box[2], box[3]],
            ],
            { padding: 100 },
          );
        } else {
          // in case of required features haven't been loaded yet
          if (featureCoordinates) {
            map.fitBounds([featureCoordinates, featureCoordinates], { padding: 150 });
            setTimeout(() => {
              doIt();
            }, 300);
          }
        }
      }
    };

    if (!map.isSourceLoaded(sourceId)) {
      const onSourcedata = (event: mapboxgl.MapSourceDataEvent & mapboxgl.EventData) => {
        if (event.sourceId === sourceId) {
          doIt();

          return;
        }

        map.once('sourcedata', onSourcedata);
      };

      map.once('sourcedata', onSourcedata);
    } else {
      doIt();
    }

    return () => {
      map.setFeatureState(
        {
          source: sourceId,
          sourceLayer: type,
          id: zoneId,
        },
        { selected: false },
      );
    };
  }, [flyToOnMount, map, type, zoneId, featureCoordinates]);

  return null;
};

export default Boundary;
