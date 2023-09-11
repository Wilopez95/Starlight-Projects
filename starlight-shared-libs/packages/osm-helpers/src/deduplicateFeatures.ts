import { cleanCoords, union } from '@turf/turf';
import { Feature, MultiPolygon, Polygon } from 'geojson';
import { mergeWith, union as arrayUnion } from 'lodash/fp';

const mergeProperties = mergeWith((value, srcValue) => {
  if (Array.isArray(value)) {
    return arrayUnion(value, srcValue) as unknown[];
  }
});

const deduplicateFeatures = (
  features: Feature<Polygon | MultiPolygon>[],
): Feature<Polygon | MultiPolygon>[] => {
  const grouped = new Map<string | number, Feature<Polygon | MultiPolygon>>();
  const tainted = new Set<string | number>();

  features.forEach(feature => {
    if (!feature.id || tainted.has(feature.id)) {
      return;
    }

    const existing = grouped.get(feature.id);

    if (existing) {
      mergeProperties(existing.properties, feature.properties);

      try {
        const newGeometry = union(existing.geometry, feature.geometry)?.geometry;

        if (newGeometry) {
          existing.geometry = newGeometry;
        }
      } catch (error) {
        console.error(`Error while merging geometries for feature ${feature.id}`);
        console.error(error);

        grouped.delete(feature.id);
        tainted.add(feature.id);
      }
    } else {
      grouped.set(feature.id, feature);
    }
  });

  return Array.from(grouped.values(), feature => {
    cleanCoords(feature.geometry, { mutate: true });

    return feature;
  });
};

export default deduplicateFeatures;
