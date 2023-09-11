# OSM helpers

This is a library for various OpenStreetMap related helpers. For now, it only exposes
`extractPolygons`, which extracts GeoJSON polygon and multi-polygon geometries from Overpass API
responses.

## Usage in OSM pipelines

OSM helpers are used for transformation of OSM entities to GeoJSON polygons in
[OSM pipeline](https://github.com/Starlightpro/starlight-hauling-osm). See the link for more
information.

TODO: migrate pipeline to use this lib directly.

## Usage in job site geofencing

For geofencing suggestions, OSM helpers are used by
[main backend](https://github.com/Starlightpro/starlight-hauling-backend) to transform features
queried from OSM into GeoJSON polygons. The following steps are used:

1. User requests geofencing suggestions.
2. Main backend queries OSM for appropriate polygons within a certain radius of the job site. The
   request is handled by the Overpass API instance in Starlight's subnets.
3. Main backend uses helpers from this package to transform the entities from OSM into polygons.
4. Frontend displays relevant polygons to the user if any are found.
5. User picks an appropriate polygon.
6. The full polygon geometry is saved to PostGIS.

N.B. if the entity's geometry is updated in OpenStreetMap, this is not reflected in PostGIS! PostGIS
only contains a geometry linked to a job site _without_ any link to the actual record in
OpenStreetMap.
