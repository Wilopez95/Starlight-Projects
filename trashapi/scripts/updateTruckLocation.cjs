/* eslint-disable import/no-extraneous-dependencies */

const autocannon = require('autocannon');

const instance = autocannon(
  {
    url: 'http://localhost:3006/trashapi/v1',
    connections: 20,
    duration: 2,
    workers: 2,
    headers: {
      // by default we add an auth token to all requests
      // authorization: 'Bearer egQfRqZhOKhd75j_oq4GE',
      'Content-type': 'application/json',
    },
    requests: [
      {
        method: 'PATCH', // this should be a put for modifying secret details
        path: 'http://localhost:3006/trashapi/v1/trucks/1/location',
        headers: {
          // let submit some json?
          authorization: 'Bearer egQfRqZhOKhd75j_oq4GE',
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          location: {
            lat: 37.784444321,
            lon: -104.94252341,
          },
        }),
      },
      {
        method: 'PATCH', // this should be a put for modifying secret details
        path: 'http://localhost:3006/trashapi/v1/trucks/1/location',
        headers: {
          // let submit some json?
          authorization: 'Bearer FAwu2qPmtV74ayzi_-qvg',
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          location: {
            lat: 37.754444321,
            lon: -104.44252341,
          },
        }),
      },
      {
        method: 'PATCH', // this should be a put for modifying secret details
        path: 'http://localhost:3006/trashapi/v1/cans/1/dropoff',
        headers: {
          // let submit some json?
          authorization: 'Bearer FAwu2qPmtV74ayzi_-qvg',
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          location: {
            name: '3646 West Rosewalk Circle, Highlands Ranch, CO 80129',
            latitude: 39.536435,
            longitude: -105.03149,
            lat: 39.536435,
            lon: -105.03149,
            type: 'LOCATION',
          },
        }),
      },
    ],
  },
  console.log,
);
process.once('SIGINT', () => {
  instance.stop();
});

// just render results
autocannon.track(instance, { renderProgressBar: false });
