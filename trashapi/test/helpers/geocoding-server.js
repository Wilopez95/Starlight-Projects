/* global before, after */
import { parse } from 'url';
import express from 'express';
import config from '../../src/config';
import mockData from '../fixtures/geo-responses.json';

export default () => {
  const { hostname, port, pathname } = parse(config.get('server.geoUrl'));
  if (
    hostname !== 'localhost' &&
    hostname !== '127.0.0.1' &&
    hostname !== '0.0.0.0' &&
    !port
  ) {
    return;
  }
  const app = express();
  app.get(pathname, async ({ query }, res) => {
    const queryKey = JSON.stringify(query);
    res.send(
      mockData[queryKey] || {
        results: [],
        status: 'ZERO_RESULTS',
      },
    );
  });
  let server;
  before(() => {
    server = app.listen(port);
  });
  after(() => server.close());
};
