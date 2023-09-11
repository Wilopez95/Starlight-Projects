import logger from '../../services/logger/index.js';
import { detailedLog } from '../../middlewares/requestLogger.js';

const logServiceRequest = (req, response) => {
  const { logger: reqLogger, skipBodyLogging, user } = req;
  const serviceLogger = reqLogger || logger;
  const {
    status,
    statusText,
    data,
    config: { baseURL, url, method, params, data: body, headers },
  } = response || {};

  serviceLogger.info(
    {
      user: detailedLog(user),
      request: {
        baseURL,
        url,
        method,
        params: detailedLog(params),
        body: detailedLog(body),
        headers: detailedLog(headers),
      },
      response: {
        status,
        statusText,
        data: skipBodyLogging ? 'skipped' : detailedLog(data),
      },
    },
    'Service data output:',
  );
};

export default logServiceRequest;
