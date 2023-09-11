import * as functions from '../utils/functions.js';
import defineTable from '../utils/defineTable.js';

const objectFields = [
  'status',
  'action',
  'size',
  'material',
  'scheduledDate',
  'scheduledStart',
  'scheduledEnd',
  'poNumber',
  'contactName',
  'contactNumber',
  'customerName',
  'instructions',
  'alleyPlacement',
  'earlyPickUp',
  'okToRoll',
  'negotiatedFill',
  'cow',
  'sos',
  'cabOver',
  'permittedCan',
  'permitNumber',
  'textOnWay',
  'profileNumber',
  'signatureRequired',
  'customerProvidedProfile',
  'priority',
  'step',
  'createdBy',
  'createdDate',
  'modifiedBy',
  'modifiedDate',
  'deleted',
  'index',
  'pendingSuspend',
  'suspendRequested',
];

const columns = [
  'id',
  'locationId1',
  'locationId2',
  'driverId',
  'documentId',
  'templateId',
  'suspensionLocationId',
  'suspendedCanId',
  'haulingBillableServiceId',
  'haulingMaterialId',
  'haulingDisposalSiteId',
  'haulingSync',
  'tenantId',
  'serviceDescription',
  'customerId',
  'haulingBusinessUnitId',
  ...objectFields,
];

export default defineTable('work_orders', columns);

export const fields = functions.fields(objectFields);
