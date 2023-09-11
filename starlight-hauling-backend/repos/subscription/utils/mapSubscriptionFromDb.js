import compose from 'lodash/fp/compose.js';

import JobSiteRepo from '../../jobSite.js';
import CustomerRepo from '../../customer.js';
import BusinessUnitRepo from '../../businessUnit.js';

import { subscriptionNestedFields } from '../../../consts/subscriptions.js';

import isProperObject from '../../../utils/isProperObject.js';
import { camelCaseKeys } from '../../../utils/dbHelpers.js';

export const mapSubscriptionFromDb = (originalObj, { parentMapper, instance }) => {
  return compose(
    obj => {
      const jobSiteRepo = JobSiteRepo.getInstance(instance.ctxState);
      const customerRepo = CustomerRepo.getInstance(instance.ctxState);
      const businessUnitRepo = BusinessUnitRepo.getInstance(instance.ctxState);

      const jobSiteMapper = jobSiteRepo.mapFields.bind(jobSiteRepo);
      const customerMapper = customerRepo.mapFields.bind(customerRepo);
      const businessUnitMapper = businessUnitRepo.mapFields.bind(businessUnitRepo);

      // all fields applied since joins' result must be camel-cased
      Object.entries(obj).forEach(([key, value]) => {
        if (subscriptionNestedFields.includes(key)) {
          return;
        }

        if (isProperObject(value)) {
          if (value) {
            delete value.event_type;
            // delete value[0].original_id;
            // TODO: re-write it better
            obj[key] = camelCaseKeys(value);

            // kind of recursive camel-casing (1 level)
            if (isProperObject(obj[key])) {
              Object.entries(obj[key]).forEach(([_key, _value]) => {
                if (isProperObject(_value)) {
                  obj[key][_key] = camelCaseKeys(_value);
                }
              });
            }
          } else {
            delete obj[key];
          }
        }
      });

      if (obj.jobSite) {
        obj.jobSite = jobSiteMapper(obj.jobSite);
      }

      if (obj.customer) {
        obj.customer = customerMapper(obj.customer);
      }

      if (obj.businessUnit) {
        obj.businessUnit = businessUnitMapper(obj.businessUnit);
      }

      if (obj.lineItems) {
        obj.lineItems = obj.lineItems
          .filter(lineItem => lineItem)
          .map(lineItem => camelCaseKeys(lineItem));
      }

      if (obj.subscriptionOrders) {
        obj.subscriptionOrders = obj.subscriptionOrders
          .filter(subscriptionOrder => subscriptionOrder)
          .map(subscriptionOrder => camelCaseKeys(subscriptionOrder));
      }

      return obj;
    },
    camelCaseKeys,
    parentMapper,
  )(originalObj);
};
