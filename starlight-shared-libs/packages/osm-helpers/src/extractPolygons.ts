import { MultiPolygon } from '@turf/helpers';
import { Feature, Polygon } from 'geojson';

import deduplicateFeatures from './deduplicateFeatures';
import osmToPolygonGeometry from './osmToPolygonGeometry';
import { Filter, Mapper, OSMElement, OSMResponse, Way } from './types';

const defaultMapper: Mapper = (polygon, geometry) => ({
  type: 'Feature',
  geometry,
  id: polygon.id,
  properties: null,
});

const defaultFilter = () => true;

const extractPolygons = (
  rawOsmData: OSMResponse,
  filter: Filter = defaultFilter,
  mapper: Mapper = defaultMapper,
): Feature[] => {
  const { polygons, ways } = rawOsmData.elements.reduce<{
    polygons: OSMElement[];
    ways: Map<string, Way>;
  }>(
    (acc, element) => {
      if (element.type === 'relation' && filter(element)) {
        acc.polygons.push(element);
      } else if (element.type === 'way') {
        if (filter(element)) {
          acc.polygons.push(element);
        }

        acc.ways.set(element.id, element);
      }

      return acc;
    },
    {
      polygons: [],
      ways: new Map<string, Way>(),
    },
  );

  const results: Feature<Polygon | MultiPolygon>[] = [];

  polygons.forEach(polygon => {
    const geometry = osmToPolygonGeometry(polygon, ways);

    if (!geometry) {
      return;
    }

    results.push(mapper(polygon, geometry));
  });

  return deduplicateFeatures(results);
};

export default extractPolygons;
