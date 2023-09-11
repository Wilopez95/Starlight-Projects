import intersect from '@turf/intersect';

import { FeatureLike } from '../types';

import { featureSetToGeometrySet } from './convert';

export const hasIntersections = (
  firstFeaturesSet: FeatureLike[],
  secondFeaturesSet: FeatureLike[],
) => {
  const firstGeometrySet = featureSetToGeometrySet(firstFeaturesSet);
  const secondGeometrySet = featureSetToGeometrySet(secondFeaturesSet);

  return secondGeometrySet.some(secondGeometry => {
    return firstGeometrySet.some(firstGeometry => intersect(firstGeometry, secondGeometry));
  });
};
