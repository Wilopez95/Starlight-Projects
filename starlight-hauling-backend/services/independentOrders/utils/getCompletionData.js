import pick from 'lodash/fp/pick.js';

const getCompletionData = pick([
  'materialId',
  'billableServiceId',
  'billableServicePrice',
  'billableServiceApplySurcharges',
  'projectId',
  'promoId',
  'disposalSiteId',

  'workOrder',

  'invoiceNotes',
  'driverInstructions',

  'lineItems',
  'thresholds',
  'manifestItems',
  'newManifestItems',

  'grandTotal',
  'paymentMethod',
  'overrideCreditLimit',
  'applySurcharges',
  'surcharges',
  'customRatesGroupId',
]);

export default getCompletionData;
