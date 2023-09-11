import omitBy from 'lodash/fp/omitBy.js';

import { HAULING_SERVICE_API_URL } from '../../config.js';
import { logger } from '../../utils/logger.js';
import { BaseRESTDataSource } from './baseRESTDataSource.js';

const omitUndefined = omitBy(val => val === undefined);

class HaulingAPI extends BaseRESTDataSource {
  constructor({ version, targetAPI } = {}) {
    super(targetAPI);

    this.version = version;
  }

  get baseURL() {
    return `${HAULING_SERVICE_API_URL}${this.version ? `/v${this.version}` : ''}`;
  }

  async getServiceItems(businessUnitId, filters = {}) {
    const { businessLineId, ...restFilters } = filters;

    const result = await this.get(
      'subscriptions/service-items/stream',
      omitUndefined({
        businessUnitId,
        serviceTypes: ['service'],
        businessLineIds: [businessLineId],
        thirdPartyHaulerId: null,
        frequencyIds: [],
        ...restFilters,
        status: 'active',
      }),
    );

    logger.debug('hauling->getServiceItems');

    return result;
  }

  async getBusinessLines() {
    const result = await this.get('business-lines');

    logger.debug(result, 'hauling->getBusinessLines');

    return result;
  }

  async getDisposalSites() {
    const result = await this.get('disposal-sites');

    logger.debug(result, 'hauling->getDisposalSites');

    return result;
  }

  async getEquipmentItems(businessLineId) {
    const result = await this.get(
      'equipment-items',
      omitUndefined({
        businessLineId,
      }),
    );

    logger.debug(result, 'hauling->getEquipmentItems');

    return result;
  }

  async getMaterials({ businessLineId, materialIds } = {}) {
    let result = await this.get(
      'materials',
      omitUndefined({
        businessLineId,
      }),
    );

    if (materialIds?.length) {
      result = result.filter(m => materialIds.includes(m.id));
    }

    logger.debug(result, 'hauling->getMaterials');

    return result;
  }
  async getCustomer({ businessUnitId } = {}) {
    const result = await this.get(
      'customers',
      omitUndefined({
        businessUnitId,
      }),
    );
    logger.debug(result, 'hauling->getCustomer');
    return result;
  }

  async getServiceAreas(businessUnitId, businessLineIds) {
    const result = await this.get(
      'service-areas',
      omitUndefined({
        businessUnitId,
      }),
    );

    logger.debug(result, 'hauling->getServiceAreas');

    const filteredByBusinessLine = result.filter(({ businessLineId }) =>
      businessLineIds.includes(businessLineId),
    );

    return filteredByBusinessLine;
  }

  async getServiceAreasByIds(ids) {
    const result = await this.post('service-areas/ids', { ids });

    logger.debug(result, 'hauling->getServiceAreasByIds');

    return result;
  }

  async get3rdPartyHaulers() {
    const result = await this.get('3rd-party-haulers');

    logger.debug(result, 'hauling->get3rdPartyHaulers');

    return result;
  }

  async getWorkOrderMedia(id, options) {
    const { isIndependent } = options;
    const URL = this._getWorkOrderMediaUrl(id, isIndependent);

    const result = await this.get(URL);

    logger.debug(result, 'hauling->getWorkOrderMedia');

    return result;
  }

  async deleteWorkOrderMedia(ids, options) {
    const { isIndependent } = options;

    const requests = ids.map(id => {
      const URL = this._getWorkOrderMediaUrl(id, isIndependent);
      return this.delete(URL);
    });

    const result = await Promise.all(requests);

    logger.debug(result, 'hauling->deleteWorkOrderMedia');

    return result;
  }

  async getTruckTypes() {
    const result = await this.get('trucks/types/all');

    logger.debug(result, 'hauling->getTrucksTypes');

    return result;
  }

  async getTrucks(businessUnitId, businessLineIds) {
    const result = await this.get(
      'trucks/all',
      omitUndefined({
        activeOnly: true,
        filterByBusinessUnit: businessUnitId,
        filterByBusinessLine: businessLineIds?.join(','),
      }),
    );

    logger.debug(result, 'hauling->getTrucks');

    return result;
  }

  async getDrivers(businessUnitId, truckId) {
    const result = await this.get(
      'drivers',
      omitUndefined({
        activeOnly: true,
        filterByBusinessUnit: businessUnitId,
        filterByTruck: truckId,
      }),
    );

    logger.debug(result, 'hauling->getDrivers');

    return result;
  }

  async getTruck(id) {
    const result = await this.get(`trucks/${id}`);

    logger.debug(result, 'hauling->getTruck');

    return result;
  }

  async getDriver(id) {
    const result = await this.get(`drivers/${id}`);

    logger.debug(result, 'hauling->getDrivers');

    return result;
  }

  _getWorkOrderMediaUrl(id, isIndependent) {
    return isIndependent
      ? `orders/independent-work-order-media/${id}`
      : `subscriptions/work-orders-media/${id}`;
  }
}

export { HaulingAPI };
