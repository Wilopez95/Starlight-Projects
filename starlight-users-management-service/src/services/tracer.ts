import tracer from 'dd-trace';
import { ENV_NAME, DD_VERSION, DD_LOGS_INJECTION } from '../config';

// initialized in its own file to avoid hoisting.
tracer.init({
  logInjection: DD_LOGS_INJECTION === 'true',
  service: 'starlight_ums',
  env: ENV_NAME,
  version: DD_VERSION,
});

export default tracer;
