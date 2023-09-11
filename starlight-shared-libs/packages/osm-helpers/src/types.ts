import { Feature, MultiPolygon, Polygon } from 'geojson';

export interface Relation {
  type: 'relation';
  id: string;
  members: RelationMember[];
  tags: Record<string, string>;
}

export interface Point {
  lon: number;
  lat: number;
}

export interface Way {
  type: 'way';
  id: string;
  geometry: Point[];
  tags: Record<string, string>;
}

export type OSMElement = Relation | Way;

export interface RelationMember {
  type: 'way' | 'node' | 'relation';
  role: string;
  ref: string;
  geometry?: Point[];
}

export interface OSMResponse {
  elements: OSMElement[];
}

export type Mapper = (
  element: OSMElement,
  geometry: MultiPolygon | Polygon,
) => Feature<MultiPolygon | Polygon>;

export type Filter = (element: OSMElement) => boolean;
