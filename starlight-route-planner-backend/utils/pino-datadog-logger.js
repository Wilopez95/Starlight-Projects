import dataDogTransport from 'pino-datadog-transport';
import Sentry from '../services/sentry.js';
export default opts =>
  dataDogTransport({
    ...opts,
    onError: (data, logItems) => {
      Sentry.captureMessage('pino-datadog-transport error', data, logItems);
    },
  });
