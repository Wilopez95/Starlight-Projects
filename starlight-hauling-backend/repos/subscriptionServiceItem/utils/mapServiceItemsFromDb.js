import compose from 'lodash/fp/compose.js';
import isEmpty from 'lodash/isEmpty.js';

import SubscriptionRepo from '../../subscription/subscription.js';
import SubscriptionOrderRepo from '../../subscriptionOrder/subscriptionOrder.js';
import BillableServiceRepo from '../../billableService.js';
import MaterialRepo from '../../material.js';
import SubscriptionLineItemRepo from '../../subscriptionLineItem.js';
import JobSitesRepo from '../../jobSite.js';
import EquipmentItemsRepo from '../../equipmentItem.js';

import { camelCaseKeys } from '../../../utils/dbHelpers.js';

export const mapServiceItemsFromDb = (originalObj, { skipNested, parentMapper, instance }) =>
  compose(
    obj => {
      if (!skipNested) {
        const subscriptionLineItemRepo = SubscriptionLineItemRepo.getInstance(instance.ctxState);
        const subscriptionOrderRepo = SubscriptionOrderRepo.getInstance(instance.ctxState);
        const bsRepo = BillableServiceRepo.getInstance(instance.ctxState);
        const materialRepo = MaterialRepo.getInstance(instance.ctxState);
        const jobSitesRepo = JobSitesRepo.getInstance(instance.ctxState);
        const equipmentItemsRepo = EquipmentItemsRepo.getInstance(instance.ctxState);
        const subscriptionRepo = SubscriptionRepo.getInstance(instance.ctxState);

        const subscriptionMapper = subscriptionRepo.mapFields.bind(subscriptionRepo);
        const bsMapper = bsRepo.mapFields.bind(bsRepo);
        const materialMapper = materialRepo.mapFields.bind(materialRepo);
        const equipmentItemsMapper = equipmentItemsRepo.mapFields.bind(equipmentItemsRepo);
        const jobSitesMapper = jobSitesRepo.mapFields.bind(jobSitesRepo);
        const subscriptionOrderMapper = subscriptionOrderRepo.mapFields.bind(subscriptionOrderRepo);
        const subscriptionLineItemMapper =
          subscriptionLineItemRepo.mapFields.bind(subscriptionLineItemRepo);
        if (!isEmpty(obj.subscription)) {
          obj.subscription = subscriptionMapper(obj.subscription);
        }

        if (!isEmpty(obj.billableService)) {
          obj.billableService = bsMapper(obj.billableService);
          obj.billableService.services = obj.services || [];
        }

        if (!isEmpty(obj.jobSite)) {
          const { id, address, coordinates } = jobSitesMapper(obj.jobSite);
          obj.jobSite = { id, address, coordinates };
        }

        if (!isEmpty(obj.material)) {
          obj.material = materialMapper(obj.material);
        }

        if (!isEmpty(obj.equipment)) {
          obj.equipment = equipmentItemsMapper(obj.equipment);
        }
        const subscriptionOrdersServicesMap = {};
        if (!isEmpty(obj.subscriptionOrdersServices)) {
          obj.subscriptionOrdersServices.forEach(item => {
            if (isEmpty(item)) {
              return;
            }
            subscriptionOrdersServicesMap[item.id] = bsMapper(item);
          });
          delete obj.subscriptionOrdersServices;
        }

        if (!isEmpty(obj.subscriptionOrders)) {
          obj.subscriptionOrders = obj.subscriptionOrders
            .filter(item => !isEmpty(item))
            .map(item => {
              const mappedItem = subscriptionOrderMapper(item);
              if (subscriptionOrdersServicesMap[mappedItem.billableServiceId]) {
                mappedItem.billableService =
                  subscriptionOrdersServicesMap[mappedItem.billableServiceId];
              }
              return mappedItem;
            });
        }

        if (!isEmpty(obj.lineItems) && !isEmpty(obj.billableLineItems)) {
          const billableLineItemsMap = obj.billableLineItems
            .filter(item => !isEmpty(item))
            .reduce((result, billableLineItem) => {
              result[billableLineItem.id] = billableLineItem;
              return result;
            }, {});
          obj.lineItems = obj.lineItems
            .filter(item => !isEmpty(item))
            .map(item => {
              const mappedItem = subscriptionLineItemMapper(item);
              mappedItem.billableLineItem = camelCaseKeys(
                billableLineItemsMap[mappedItem.billableLineItemId],
              );
              if (mappedItem.effectiveDate) {
                mappedItem.effectiveDate = new Date(mappedItem.effectiveDate);
              }

              return mappedItem;
            });
          delete obj.billableLineItems;
        }
      }

      obj.price = Number(obj.price);
      obj.quantity = Number(obj.quantity);
      obj.prorateTotal = Number(obj.prorateTotal);
      obj.nextPrice = Number(obj.nextPrice);
      obj.recalculate = !!obj.recalculate;
      obj.isDeleted = !!obj.isDeleted;

      return obj;
    },
    camelCaseKeys,
    parentMapper,
  )(originalObj);
