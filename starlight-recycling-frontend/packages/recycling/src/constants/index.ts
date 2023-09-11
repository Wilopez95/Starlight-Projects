import { getServiceInfo } from '@starlightpro/common';
import { Point } from 'geojson';
import { LngLatBoundsLike } from 'mapbox-gl';

export { default as serverMessages } from './serverMessages';

const serviceInfo = getServiceInfo();

export const LOCAL_STORAGE_USER_KEY = serviceInfo
  ? `login-${serviceInfo.platformAccount}:${serviceInfo.service}:${serviceInfo.serviceAccount}`
  : 'login-token';

export const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1Ijoic3RhcmxpZ2h0cHJvIiwiYSI6ImNqZjBtZzRhaTBwODEyeG8wNW91d3hzNWsifQ.lCD7x0NdId1ltyqvQcfNSw';
// 'pk.eyJ1IjoiaG9yb3Noa28iLCJhIjoiY2tkcHI0MjA3MjRkczMwcm9uZGk1YWI5eiJ9.G1aE5Z049Mg7q1koajcxdQ';

export const US_CENTROID: Point & { coordinates: [number, number] } = {
  type: 'Point',
  coordinates: [-98.35, 39.5],
};

export const US_BBOX: LngLatBoundsLike = [
  [-179, 15],
  [-60, 72],
];

export const MAPBOX_ADMINISTRATIVE_TILESET_URL = 'mapbox://starlightpro.administrative_us';
export const MAPBOX_ADMINISTRATIVE_TILESET_ID = 'starlightpro.administrative_us';

export const printNodeMockedComputer = JSON.parse(
  '{"id":0,"name":"PrintNode Test Computer","inet":null,"inet6":null,"hostname":null,"version":null,"jre":null,"createTimestamp":"2015-11-16T23:14:12.354Z","state":"disconnected"}',
);
export const printNodeMockedScale = JSON.parse(
  '{"mass":[0,null],"deviceName":"PrintNode Test Scale","deviceNum":0,"port":"\\\\\\\\?\\\\hid#vid_0922&pid_8004#7&1f8c62d&0&0000#{4d1e55b2-f16f-11cf-88cb-001111000030}","count":null,"measurement":{"g":779000000000},"clientReportedCreateTimestamp":"2015-11-26T16:55:05.840Z","ntpOffset":null,"ageOfData":164,"computerId":0,"vendor":"PrintNode","product":"Test Scale","vendorId":0,"productId":0}',
);
export const ENABLE_TEST_SCALES = process.env.ENABLE_TEST_SCALES === 'true';

const ws = window.location.origin.includes('localhost')
  ? 'ws://localhost:3010'
  : window.location.origin.replace(/^https(.*)/, 'wss$1').replace(/^http(.*)/, 'ws$1');

export const WS_SERVER_HOST = `${ws}/api/ws/printnode`;
