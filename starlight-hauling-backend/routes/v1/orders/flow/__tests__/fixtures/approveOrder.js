import pick from 'lodash/fp/pick.js';

import {
  updatedPtOrderDate,
  updatedRoOrderDate,
} from '../../../__tests__/fixtures/updateOrders.js';
import {
  newPtDeliveryOrderInputDefault,
  newRoDeliveryOrderInputDefault,
} from '../../../__tests__/fixtures/addOrders.js';

import { ACTION } from '../../../../../../consts/actions.js';

export const ptFirstEquipment = '342431';
export const roFirstEquipment = '342432';
export const truckId = 55;

export const mapPtWorkOrderForApproval = ({ mediaFiles = [], ...workOrder }) => ({
  ...workOrder,
  mediaFiles: mediaFiles.map(pick(['url', 'timestamp', 'author', 'fileName'])),
  startWorkOrderDate: updatedPtOrderDate.toISOString(),
  arriveOnSiteDate: updatedPtOrderDate.toISOString(),
  startServiceDate: updatedPtOrderDate.toISOString(),
  finishWorkOrderDate: updatedPtOrderDate.toISOString(),
  completionDate: updatedPtOrderDate.toISOString(),

  droppedEquipmentItem: ptFirstEquipment,
  route: newPtDeliveryOrderInputDefault.orders[0].route,
  truckId,
});
export const mapPtOrderForApproval = ({
  material = {},
  billableService = {},
  project = {},
  promo = {},
  disposalSite = {},
  jobSite2 = {},
  customer = {},
  workOrder = {},
  lineItems = [],
  thresholds = [],
  manifestItems = [],
  newManifestItems = [],
  ...order
}) => {
  const { originalId: materialId } = material;
  const { originalId: billableServiceId } = billableService;
  const { originalId: projectId } = project;
  const { originalId: promoId } = promo;
  const { originalId: disposalSiteId } = disposalSite;
  const { originalId: jobSite2Id } = jobSite2;
  const { originalId: customerId } = customer;
  return {
    ...order,
    action: ACTION.delivery,

    noBillableService: newPtDeliveryOrderInputDefault.orders[0].noBillableService,
    billableServicePrice: newPtDeliveryOrderInputDefault.orders[0].billableServicePrice,
    billableServiceApplySurcharges:
      newPtDeliveryOrderInputDefault.orders[0].billableServiceApplySurcharges,
    overrideCreditLimit: newPtDeliveryOrderInputDefault.orders[0].overrideCreditLimit,

    materialId: materialId ?? newPtDeliveryOrderInputDefault.orders[0].materialId,
    billableServiceId:
      billableServiceId ?? newPtDeliveryOrderInputDefault.orders[0].billableServiceId,
    promoId: promoId ?? newPtDeliveryOrderInputDefault.orders[0].promoId,
    jobSite2Id: jobSite2Id ?? newPtDeliveryOrderInputDefault.orders[0].jobSite2Id,
    customerId: customerId ?? newPtDeliveryOrderInputDefault.orders[0].customerId,

    projectId: projectId || newPtDeliveryOrderInputDefault.orders[0].projectId || null,
    disposalSiteId:
      disposalSiteId || newPtDeliveryOrderInputDefault.orders[0].disposalSiteId || null,

    workOrder: mapPtWorkOrderForApproval(
      pick([
        'id',
        'woNumber',
        'pickedUpEquipmentItem',
        'weight',
        'weightUnit',
        'ticket',
        'ticketUrl',
        'mediaFiles',
      ])(workOrder),
    ),
    lineItems: lineItems.map(
      pick([
        'id',
        'billableLineItemId',
        'materialId',
        'globalRatesLineItemsId',
        'customRatesGroupLineItemsId',
        'price',
        'quantity',
        'applySurcharges',
        'manifestNumber',
      ]),
    ),
    thresholds: thresholds.map(
      pick(['id', 'thresholdId', 'threshold', 'price', 'quantity', 'applySurcharges']),
    ),
    manifestItems: manifestItems.map(
      pick([
        'id',
        'workOrderId',
        'materialId',
        'dispatchId',
        'url',
        'manifestNumber',
        'quantity',
        'unitType',
      ]),
    ),
    newManifestItems: newManifestItems.map(
      pick(['id', 'workOrderId', 'materialId', 'manifestNumber', 'quantity', 'unitType']),
    ),
  };
};
export const mapDetailsToPtOrderApprovalInput = details =>
  mapPtOrderForApproval(
    pick([
      'noBillableService',
      'applySurcharges',
      'action',
      'billableServiceApplySurcharges',
      'paymentMethod',
      'overrideCreditLimit',
      'grandTotal',
      'isRollOff',
      'driverInstructions',
      'invoiceNotes',
      'material',
      'billableService',
      'project',
      'promo',
      'disposalSite',
      'jobSite2',
      'customer',
      'workOrder',
      'lineItems',
      'thresholds',
      'manifestItems',
      'newManifestItems',
    ])(details),
  );

export const mapRoWorkOrderForApproval = ({ mediaFiles = [], ...workOrder }) => ({
  ...workOrder,
  mediaFiles: mediaFiles.map(pick(['url', 'timestamp', 'author', 'fileName'])),
  startWorkOrderDate: updatedRoOrderDate.toISOString(),
  arriveOnSiteDate: updatedRoOrderDate.toISOString(),
  startServiceDate: updatedRoOrderDate.toISOString(),
  finishWorkOrderDate: updatedRoOrderDate.toISOString(),
  completionDate: updatedRoOrderDate.toISOString(),

  droppedEquipmentItem: roFirstEquipment,
  route: newRoDeliveryOrderInputDefault.orders[0].route,
  truckId,
});
export const mapRoOrderForApproval = ({
  material = {},
  billableService = {},
  project = {},
  promo = {},
  disposalSite = {},
  jobSite2 = {},
  customer = {},
  workOrder = {},
  lineItems = [],
  thresholds = [],
  manifestItems = [],
  newManifestItems = [],
  ...order
}) => {
  const { originalId: materialId } = material;
  const { originalId: billableServiceId } = billableService;
  const { originalId: projectId } = project;
  const { originalId: promoId } = promo;
  const { originalId: disposalSiteId } = disposalSite;
  const { originalId: jobSite2Id } = jobSite2;
  const { originalId: customerId } = customer;
  return {
    ...order,
    action: ACTION.delivery,

    noBillableService: newRoDeliveryOrderInputDefault.orders[0].noBillableService,
    billableServicePrice: newRoDeliveryOrderInputDefault.orders[0].billableServicePrice,
    billableServiceApplySurcharges:
      newRoDeliveryOrderInputDefault.orders[0].billableServiceApplySurcharges,
    overrideCreditLimit: newRoDeliveryOrderInputDefault.orders[0].overrideCreditLimit,

    materialId: materialId ?? newRoDeliveryOrderInputDefault.orders[0].materialId,
    billableServiceId:
      billableServiceId ?? newRoDeliveryOrderInputDefault.orders[0].billableServiceId,
    promoId: promoId ?? newRoDeliveryOrderInputDefault.orders[0].promoId,
    jobSite2Id: jobSite2Id ?? newRoDeliveryOrderInputDefault.orders[0].jobSite2Id,
    customerId: customerId ?? newRoDeliveryOrderInputDefault.orders[0].customerId,

    projectId: projectId || newRoDeliveryOrderInputDefault.orders[0].projectId || null,
    disposalSiteId:
      disposalSiteId || newRoDeliveryOrderInputDefault.orders[0].disposalSiteId || null,

    workOrder: mapRoWorkOrderForApproval(
      pick([
        'id',
        'woNumber',
        'pickedUpEquipmentItem',
        'weight',
        'weightUnit',
        'ticket',
        'ticketUrl',
        'mediaFiles',
      ])(workOrder),
    ),
    lineItems: lineItems.map(
      pick([
        'id',
        'billableLineItemId',
        'materialId',
        'globalRatesLineItemsId',
        'customRatesGroupLineItemsId',
        'price',
        'quantity',
        'applySurcharges',
        'manifestNumber',
      ]),
    ),
    thresholds: thresholds.map(
      pick(['id', 'thresholdId', 'threshold', 'price', 'quantity', 'applySurcharges']),
    ),
    manifestItems: manifestItems.map(
      pick([
        'id',
        'workOrderId',
        'materialId',
        'dispatchId',
        'url',
        'manifestNumber',
        'quantity',
        'unitType',
      ]),
    ),
    newManifestItems: newManifestItems.map(
      pick(['id', 'workOrderId', 'materialId', 'manifestNumber', 'quantity', 'unitType']),
    ),
  };
};
export const mapDetailsToRoOrderApprovalInput = details =>
  mapRoOrderForApproval(
    pick([
      'noBillableService',
      'applySurcharges',
      'action',
      'billableServiceApplySurcharges',
      'paymentMethod',
      'overrideCreditLimit',
      'grandTotal',
      'isRollOff',
      'driverInstructions',
      'invoiceNotes',
      'material',
      'billableService',
      'project',
      'promo',
      'disposalSite',
      'jobSite2',
      'customer',
      'workOrder',
      'lineItems',
      'thresholds',
      'manifestItems',
      'newManifestItems',
    ])(details),
  );
