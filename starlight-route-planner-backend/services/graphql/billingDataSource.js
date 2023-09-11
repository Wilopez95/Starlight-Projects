import { BILLING_SERVICE_API_URL } from '../../config.js';
import { logger } from '../../utils/logger.js';
import { BaseRESTDataSource } from './baseRESTDataSource.js';

class BillingAPI extends BaseRESTDataSource {
  constructor({ version, targetAPI } = {}) {
    super(targetAPI);

    this.version = version;
  }

  get baseURL() {
    return `${BILLING_SERVICE_API_URL}${this.version ? `/v${this.version}` : ''}`;
  }

  async getDailyRouteReport(dailyRouteId) {
    const params = { dailyRouteId };

    const result = await this.get('/reports/download-route-sheet', params);

    logger.debug(result, 'billing->getDailyRouteReport');

    return result;
  }
}

export { BillingAPI };
