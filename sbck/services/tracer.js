import tracer from 'dd-trace';
import { DD_VERSION, DD_LOGS_INJECTION, ENV_NAME } from '../config.js';

// initialized in its own file to avoid hoisting.
tracer.init({
  // @ts-expect-error dotenv lib handles the env vars
  logInjection: DD_LOGS_INJECTION === 'true',
  service: 'starlight_billing',
  env: ENV_NAME,
  version: DD_VERSION,
});

export default tracer;
