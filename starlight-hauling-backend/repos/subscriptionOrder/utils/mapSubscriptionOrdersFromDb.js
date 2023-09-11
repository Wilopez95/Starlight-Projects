import compose from 'lodash/fp/compose.js';
import isEmpty from 'lodash/isEmpty.js';

import SubscriptionServiceItemRepo from '../../subscriptionServiceItem/subscriptionServiceItem.js';
import SubscriptionsRepo from '../../subscription/subscription.js';
import BillableServiceRepo from '../../billableService.js';
import MaterialRepo from '../../material.js';
import ContactRepo from '../../contact.js';
import JobSiteRepo from '../../jobSite.js';
import CustomerRepo from '../../customer.js';
import BusinessLineRepo from '../../businessLine.js';
import PurchaseOrderRepo from '../../purchaseOrder.js';

import { camelCaseKeys } from '../../../utils/dbHelpers.js';

export const mapSubscriptionOrdersFromDb = (
  originalObj,
  { skipNested, lineItemsMap, parentMapper, instance },
) =>
  compose(
    obj => {
      const jobSiteRepo = JobSiteRepo.getInstance(instance.ctxState);
      const jobSiteMapper = jobSiteRepo.mapFields.bind(jobSiteRepo);

      if (!isEmpty(lineItemsMap)) {
        obj.lineItems = lineItemsMap[obj.id];
      }
      if (!isEmpty(obj.customRatesGroup)) {
        obj.customRatesGroup = camelCaseKeys(obj.customRatesGroup);
      }
      if (!isEmpty(obj.permit)) {
        obj.permit = camelCaseKeys(obj.permit);
      }

      if (!isEmpty(obj.mediaFiles)) {
        obj.mediaFiles = obj.mediaFiles.map(camelCaseKeys);
      }

      if (!isEmpty(obj.destinationJobSite)) {
        obj.destinationJobSite = jobSiteMapper(obj.destinationJobSite);
      }

      if (!skipNested) {
        if (!isEmpty(obj.subscription)) {
          const subscriptionsRepo = SubscriptionsRepo.getInstance(instance.ctxState);
          const subscriptionMapper = subscriptionsRepo.mapFields.bind(subscriptionsRepo);
          obj.subscription = subscriptionMapper(obj.subscription);
        }
        if (!isEmpty(obj.subscriptionServiceItem)) {
          const subscriptionServiceItemRepo = SubscriptionServiceItemRepo.getInstance(
            instance.ctxState,
          );
          const bsRepo = BillableServiceRepo.getInstance(instance.ctxState);
          const materialRepo = MaterialRepo.getInstance(instance.ctxState);
          const contactRepo = ContactRepo.getInstance(instance.ctxState);
          const businessLineRepo = BusinessLineRepo.getInstance(instance.ctxState);
          const customerRepo = CustomerRepo.getInstance(instance.ctxState);
          const purchaseOrderRepo = PurchaseOrderRepo.getInstance(instance.ctxState);

          const serviceItemMapper = subscriptionServiceItemRepo.mapFields.bind(
            subscriptionServiceItemRepo,
          );
          const billableServiceMapper = bsRepo.mapFields.bind(bsRepo);
          const materialMapper = materialRepo.mapFields.bind(materialRepo);
          const contactMapper = contactRepo.mapFields.bind(contactRepo);
          const businessLineMapper = businessLineRepo.mapFields.bind(businessLineRepo);
          const customerMapper = customerRepo.mapFields.bind(customerRepo);
          const purchaseOrdersMapper = purchaseOrderRepo.mapFields.bind(purchaseOrderRepo);

          obj.subscriptionServiceItem = serviceItemMapper(obj.subscriptionServiceItem);
          if (!isEmpty(obj.jobSite)) {
            obj.jobSite = jobSiteMapper(obj.jobSite);
          }
          if (!isEmpty(obj.businessLine)) {
            obj.businessLine = businessLineMapper(obj.businessLine);
          }
          if (!isEmpty(obj.customer)) {
            obj.customer = customerMapper(obj.customer);
          }
          if (!isEmpty(obj.material)) {
            obj.subscriptionServiceItem.material = materialMapper(obj.material);
            delete obj.material;
          }
          if (!isEmpty(obj.itemBillableService)) {
            obj.subscriptionServiceItem.billableService = billableServiceMapper(
              obj.itemBillableService,
            );
            delete obj.itemBillableService;
          }

          if (!isEmpty(obj.orderMaterial)) {
            obj.material = materialMapper(obj.orderMaterial);
            delete obj.orderMaterial;
          }

          if (!isEmpty(obj.orderBillableService)) {
            obj.billableService = billableServiceMapper(obj.orderBillableService);
            delete obj.orderBillableService;
          }

          if (!isEmpty(obj.jobSiteContact)) {
            obj.jobSiteContact = contactMapper(obj.jobSiteContact);
          }

          if (!isEmpty(obj.subscriptionContact)) {
            obj.subscriptionContact = contactMapper(obj.subscriptionContact);
          }

          if (!isEmpty(obj.purchaseOrder)) {
            obj.purchaseOrder = purchaseOrdersMapper(obj.purchaseOrder);
          }
        }
      }

      obj.price = Number(obj.price);
      obj.quantity = Number(obj.quantity);
      obj.workOrdersCount = Number(obj.workOrdersCount);
      obj.grandTotal = Number(obj.grandTotal);
      obj.billableLineItemsTotal = Number(obj.billableLineItemsTotal);
      obj.hasAssignedRoutes = !!obj.hasAssignedRoutes;
      obj.hasComments = !!obj.hasComments;
      obj.oneTime = !!obj.oneTime;
      obj.canReschedule = !!obj.canReschedule;
      obj.someoneOnSite = !!obj.someoneOnSite;
      obj.highPriority = !!obj.highPriority;
      obj.unlockOverrides = !!obj.unlockOverrides;
      obj.earlyPick = !!obj.earlyPick;
      obj.jobSiteContactTextOnly = !!obj.jobSiteContactTextOnly;
      obj.alleyPlacement = !!obj.alleyPlacement;
      obj.toRoll = !!obj.toRoll;
      obj.poRequired = !!obj.poRequired;
      obj.permitRequired = !!obj.permitRequired;
      obj.lineItems = obj.lineItems ?? [];

      return obj;
    },
    camelCaseKeys,
    parentMapper,
  )(originalObj);
