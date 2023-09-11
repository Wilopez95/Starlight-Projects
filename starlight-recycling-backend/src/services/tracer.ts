import tracer from 'dd-trace';
import {
  DD_ENV,
  DD_VERSION,
  DD_PROFILING_ENABLED,
  DD_RUNTIME_METRICS_ENABLED,
  DD_LOGS_INJECTION,
} from '../config';

// initialized in its own file to avoid hoisting.
tracer.init({
  // @ts-expect-error dotenv lib handles the env vars
  logInjection: DD_LOGS_INJECTION,
  service: 'starlight_recycling',
  env: DD_ENV,
  version: DD_VERSION,
  // @ts-expect-error dotenv lib handles the env vars
  profiling: DD_PROFILING_ENABLED,
  // @ts-expect-error dotenv lib handles the env vars
  runtimeMetrics: DD_RUNTIME_METRICS_ENABLED,
});

export default tracer;
