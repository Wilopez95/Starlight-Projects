declare module '@mapbox/geojsonhint' {
  namespace GeoJSONHint {
    export function hint(geoJson: GeoJSON.GeoJsonObject): Error[];
  }

  export default GeoJSONHint;
}

declare module '@mapbox/geojson-rewind' {
  export default function rewind<T extends GeoJSON.GeoJsonObject>(
    geoJson: T,
    clockwise: boolean,
  ): T;
}
