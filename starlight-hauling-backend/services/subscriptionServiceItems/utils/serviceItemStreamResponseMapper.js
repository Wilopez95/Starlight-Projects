import camelCase from 'lodash/camelCase.js';
import mapKeys from 'lodash/mapKeys.js';
import pick from 'lodash/pick.js';

export class serviceItemStreamResponseMapper {
  static mapServiceItem(rawServiceItem) {
    const serviceItem = this._camelCaseKeys(rawServiceItem);

    const result = {
      ...pick(serviceItem, [
        'id',
        'originalId',
        'subscriptionId',
        'serviceFrequencyId',
        'serviceDaysOfWeek',
      ]),
      subscription: this._mapSubscription(serviceItem.subscription),
      jobSite: this._mapJobSite(serviceItem.jobSite),
      material: this._mapMaterial(serviceItem.material),
      billableService: this._mapBillableService(serviceItem.billableService),
      serviceArea: this._mapServiceArea(serviceItem.serviceArea),
      customer: this._mapCustomer(serviceItem.customer),
    };

    return result;
  }

  static _mapSubscription(rawSubscription) {
    const subscription = this._camelCaseKeys(rawSubscription);
    const result = pick(subscription, [
      'id',
      'originalId',
      'thirdPartyHaulerId',
      'status',
      'customerId',
      'customerJobSiteId',
      'jobSiteNote',
      'jobSiteContactId',
      'driverInstructions',
      'equipmentType',
      'reason',
      'reasonDescription',
      'createdAt',
      'updatedAt',
      'businessLineId',
      'businessUnitId',
      'startDate',
      'endDate',
      'bestTimeToComeFrom',
      'bestTimeToComeTo',
    ]);

    return result;
  }

  static _mapJobSite(rawJobSite) {
    const jobSite = this._camelCaseKeys(rawJobSite);
    const result = pick(jobSite, [
      'id',
      'originalId',
      'addressLine1',
      'addressLine2',
      'city',
      'state',
      'zip',
      'coordinates',
    ]);

    return result;
  }

  static _mapMaterial(rawMaterial) {
    const material = this._camelCaseKeys(rawMaterial);
    const result = pick(material, ['id', 'originalId']);

    return result;
  }

  static _mapBillableService(rawBillableService) {
    const billableService = this._camelCaseKeys(rawBillableService);
    const result = pick(billableService, [
      'id',
      'originalId',
      'description',
      'equipmentItemId',
      'action',
    ]);

    return result;
  }

  static _mapServiceArea(rawServiceArea) {
    const serviceArea = this._camelCaseKeys(rawServiceArea);
    const result = pick(serviceArea, ['id', 'originalId']);

    return result;
  }

  static _mapCustomer(rawCustomer) {
    const customer = this._camelCaseKeys(rawCustomer);
    const result = pick(customer, ['id', 'originalId']);

    return result;
  }

  static _camelCaseKeys(obj) {
    return mapKeys(obj, (value, key) => camelCase(key));
  }
}
