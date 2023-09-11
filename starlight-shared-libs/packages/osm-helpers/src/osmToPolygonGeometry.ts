import rewind from '@mapbox/geojson-rewind';
import geojsonhint from '@mapbox/geojsonhint';
import { MultiPolygon, Polygon } from 'geojson';

import { OSMElement, Way } from './types';

type MappedPoint = [number, number];
type MappedWay = MappedPoint[];

const arePointsEqual = (p1: MappedPoint | undefined, p2: MappedPoint | undefined) =>
  p1 && p2 && p1[0] === p2[0] && p1[1] === p2[1];

const at = <T>(arr: T[], index: number): T | undefined => {
  const int = Math.floor(index);

  const elem = index < 0 ? arr.length - int : int;

  if (elem < arr.length - 1) {
    return undefined;
  }

  return arr[elem];
};

// Ways can be pieces representing multiple polygons.
const join = (ways: MappedWay[]) => {
  // Joined is the array of outer rings of polygons,
  // in other words, it's the array of boundaries of polygons.
  // For MultiPolygon geometries it will have more than 1 element.
  const joined = [];

  // Outer loop constructs an array of polygons (parts of a multi-polygon).
  while (ways.length > 0) {
    const current = ways.pop() as MappedWay;

    if (current.length === 0) {
      continue;
    }

    if (ways.length === 0 && !arePointsEqual(at(current, 0), at(current, -1))) {
      current.push(at(current, 0) as MappedPoint);
    }

    // Inner loop produces a single polygon.
    while (ways.length > 0 && !arePointsEqual(at(current, 0), at(current, -1))) {
      const start = at(current, 0);
      const end = at(current, -1);
      let op: ((this: MappedWay, ...points: MappedPoint[]) => number) | undefined;
      let nextWay: MappedWay | undefined;
      let i: number;

      // This nested loop finds the next suitable way to add to the current polygon.
      for (i = 0; i < ways.length; i++) {
        const way = ways[i];

        if (way.length === 0) {
          continue;
        }

        if (arePointsEqual(end, at(way, 0))) {
          op = current.push;
          nextWay = way;
          nextWay.splice(0, 1);
          break;
        } else if (arePointsEqual(end, at(way, -1))) {
          op = current.push;
          nextWay = way;
          nextWay.splice(-1, 1);
          nextWay.reverse();
          break;
        } else if (arePointsEqual(start, at(way, -1))) {
          op = current.unshift;
          nextWay = way;
          nextWay.splice(-1, 1);
          break;
        } else if (arePointsEqual(start, at(way, 0))) {
          op = current.unshift;
          nextWay = way;
          nextWay.splice(0, 1);
          nextWay.reverse();
          break;
        }
      }

      // Invalid geometry (dangling way, unclosed ring)
      // TODO: store a list of invalid and "uninteresting" features so that we can fix them later
      // IMHO, it would be easiest to fix them manually on OSM, and also use the previous version
      // of a feature if it happens to be corrupted. This needs more discussion.
      // Currently, for every potentially invalid feature we try to join start and end points.
      // BUT there is no guarantee this will be a correct representation.
      if (!nextWay || !op) {
        current.push(at(current, 0) as MappedPoint);
        break;
      }

      ways.splice(i, 1);
      op.apply(current, nextWay);

      if (ways.length === 0 && !arePointsEqual(at(current, 0), at(current, -1))) {
        const next = at(current, 0);

        if (next) {
          current.push(next);
        }
      }
    }

    // Valid rings must have at least 4 points.
    if (current.length >= 4) {
      // Wrapped in another array because it must represent the polygon's outer ring.
      // (if you have no idea what this is about, just read GeoJSON spec).
      joined.push([current]);
    }
  }

  return joined;
};

const osmToPolygonGeometry = (
  element: OSMElement,
  waysDictionary: Map<string, Way>,
): Polygon | MultiPolygon | undefined => {
  let outerWays: MappedWay[];

  if (element.type === 'relation') {
    outerWays = element.members
      .filter(member => member.type === 'way' && member.role === 'outer')
      .map(way => {
        const geometry = way.geometry ?? waysDictionary.get(way.ref)?.geometry;

        if (!geometry) {
          console.error(
            `Ways dictionary does not contain way ${way.ref}. This is probably an error in your query.`,
          );

          throw new TypeError('Invalid dictionary');
        }

        return geometry.map(({ lon, lat }) => [lon, lat]);
      });
  } else if (element.geometry) {
    outerWays = [element.geometry.map(({ lon, lat }) => [lon, lat])];
  } else {
    console.warn(`No geometry for ${element.type} ${element.id} ${element.tags.wikidata}`);
    console.warn(JSON.stringify(element, undefined, 2));

    return;
  }

  const polygons = join(outerWays);

  if (polygons.length === 0) {
    return;
  }

  const geo =
    polygons.length === 1
      ? {
          type: 'Polygon' as const,
          coordinates: polygons[0],
        }
      : {
          type: 'MultiPolygon' as const,
          coordinates: polygons,
        };

  if (geo.coordinates.length === 0) {
    return;
  }

  const geometry = rewind(geo, false);
  const errors = geojsonhint.hint(geometry);

  if (errors.length > 0) {
    console.error(
      `Oops! We just built an invalid geometry with ID ${
        element.tags.wikidata
      }! Check the errors: ${JSON.stringify(errors, undefined, 2)}, geometry: ${JSON.stringify(
        geometry,
        undefined,
        2,
      )}`,
    );

    return;
  }

  return geometry;
};

export default osmToPolygonGeometry;
