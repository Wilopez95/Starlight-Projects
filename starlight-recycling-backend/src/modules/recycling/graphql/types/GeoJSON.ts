import { GraphQLScalarType } from 'graphql';
import { FeatureCollection, Feature, Geometry, Point } from 'geojson';

export const FeatureCollectionScalar = new GraphQLScalarType({
  name: 'FeatureCollection',
  description: 'GeoJSON FeatureCollection as a Scalar',
  parseValue(value: FeatureCollection): FeatureCollection {
    return value; // get as is
  },
  serialize(value: FeatureCollection): FeatureCollection {
    return value; // send as is
  },
});

export const FeatureScalar = new GraphQLScalarType({
  name: 'Feature',
  description: 'GeoJSON Feature as a Scalar',
  parseValue(value: Feature): Feature {
    return value; // get as is
  },
  serialize(value: Feature): Feature {
    return value; // send as is
  },
});

export const GeometryScalar = new GraphQLScalarType({
  name: 'Geometry',
  description: 'GeoJSON Geometry as a Scalar',
  parseValue(value: Geometry): Geometry {
    return value; // get as is
  },
  serialize(value: Geometry): Geometry {
    return value; // send as is
  },
});

export const PointScalar = new GraphQLScalarType({
  name: 'Point',
  description: 'GeoJSON Point as a Scalar',
  parseValue(value: Point): Point {
    return value; // get as is
  },
  serialize(value: Point): Point {
    return value; // send as is
  },
});
