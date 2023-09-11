import axios from 'axios';
import osmHelpers from '@starlightpro/osm-helpers';

import { OVERPASS_HOST } from '../config.js';

const makeRequest = async query => {
  const response = await axios.post(
    OVERPASS_HOST,
    new URLSearchParams({ data: query }).toString(),
    {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    },
  );

  return response;
};

export const findNearbyConstructionSites = async (point, radius) => {
  const {
    coordinates: [lon, lat],
  } = point;

  const query = `
    [out:json];
    (
        wr(around:${radius},${lat},${lon})[construction];
        wr(around:${radius},${lat},${lon})[landuse=construction];
        wr(around:${radius},${lat},${lon})[building=construction];
    );
    out geom;
    `;

  const response = await makeRequest(query);

  return osmHelpers.extractPolygons(response);
};
