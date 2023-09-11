import SubscriptionServiceItemRepo from '../../subscriptionServiceItem/subscriptionServiceItem.js';
import SubscriptionRepo from '../../subscription/subscription.js';
import CustomerRepo from '../../customer.js';
import BusinessLineRepo from '../../businessLine.js';
import JobSiteRepo from '../../jobSite.js';
import BillableServiceRepo from '../../billableService.js';
import MaterialRepo from '../../material.js';
import ContactRepo from '../../contact.js';
import GlobalRatesServiceRepo from '../../globalRatesService.js';
import CustomGroupRatesServiceRepo from '../../customRatesGroupService.js';
import ThirdPartyHaulerRepo from '../../3rdPartyHaulers.js';
import CustomRatesGroupRepo from '../../customRatesGroup.js';
import PermitRepo from '../../permit.js';
import PurchaseOrderRepo from '../../purchaseOrder.js';

import { TABLE_NAME, subscriptionsOrderDetailsFields } from '../../../consts/subscriptionOrders.js';

import { unambiguousCondition, unambiguousSelect } from '../../../utils/dbHelpers.js';
import { getNeedsApprovalSelect } from './getNeedsApprovalSelect.js';

export const getDetailsQuery = (
  trx,
  schemaName,
  userId,
  {
    condition: { businessUnitId, businessLineId, customerId, ...condition } = {},
    fields = subscriptionsOrderDetailsFields,
    whereIn = [],
    joinedFields = [],
  },
) => {
  const subscriptionsServiceItemsTable = SubscriptionServiceItemRepo.TABLE_NAME;
  const billableServicesHT = BillableServiceRepo.getHistoricalTableName();
  const materialsHT = MaterialRepo.getHistoricalTableName();
  const contactsHT = ContactRepo.getHistoricalTableName();
  const globalRateHT = GlobalRatesServiceRepo.getHistoricalTableName();
  const customRateHT = CustomGroupRatesServiceRepo.getHistoricalTableName();
  const thirdPartyHT = ThirdPartyHaulerRepo.getHistoricalTableName();
  const customRateGroupHT = CustomRatesGroupRepo.getHistoricalTableName();
  const permitHT = PermitRepo.getHistoricalTableName();

  const subscriptionsTable = SubscriptionRepo.TABLE_NAME;
  const jobSiteHT = JobSiteRepo.getHistoricalTableName();
  const businessLineTable = BusinessLineRepo.TABLE_NAME;
  const customerHT = CustomerRepo.getHistoricalTableName();
  const purchaseOrderTable = PurchaseOrderRepo.TABLE_NAME;

  const selects = [];

  selects.push(
    ...unambiguousSelect(TABLE_NAME, fields),
    trx.raw('to_json(??.*) as ??', [subscriptionsServiceItemsTable, 'subscriptionServiceItem']),
    trx.raw('to_json(??.*) as ??', ['serviceItemMaterial', 'material']),
    trx.raw('to_json(??.*) as ??', ['orderMaterial', 'orderMaterial']),
    trx.raw('to_json(??.*) as ??', ['jcht', 'jobSiteContact']),
    trx.raw('to_json(??.*) as ??', ['scht', 'subscriptionContact']),
    trx.raw('to_json(??.*) as ??', ['osht', 'orderBillableService']),
    trx.raw('to_json(??.*) as ??', ['isht', 'itemBillableService']),
    trx.raw('to_json(??.*) as ??', ['subjobsite', 'jobSite']),
    trx.raw('to_json(??.*) as ??', ['destjobsite', 'destinationJobSite']),
    trx.raw('??.?? as ??', [globalRateHT, 'originalId', 'globalRatesServicesId']),
    trx.raw('??.?? as ??', [customRateHT, 'originalId', 'customRatesGroupServicesId']),
    trx.raw('??.?? as ??', [thirdPartyHT, 'originalId', 'thirdPartyHaulerId']),
    trx.raw('??.?? as ??', [thirdPartyHT, 'description', 'thirdPartyHaulerDescription']),
    trx.raw('to_json(??.*) as ??', [jobSiteHT, 'jobSite']),
    trx.raw('to_json(??.*) as ??', [businessLineTable, 'businessLine']),
    trx.raw('to_json(??.*) as ??', [customerHT, 'customer']),
    trx.raw('to_json(??.*) as ??', [customRateGroupHT, 'customRatesGroup']),
    trx.raw('to_json(??.*) as ??', [permitHT, 'permit']),
    trx.raw('to_json(??.*) as ??', [purchaseOrderTable, 'purchaseOrder']),
  );

  if (joinedFields.includes('businessUnitId')) {
    selects.push(`${subscriptionsTable}.businessUnitId`);
  }

  if (joinedFields.includes('businessLineId')) {
    selects.push(`${subscriptionsTable}.businessLineId`);
  }

  selects.push(trx.raw(`${getNeedsApprovalSelect()} as ??`, 'status'));

  let query = trx(TABLE_NAME)
    .withSchema(schemaName)
    .select(selects)
    .innerJoin(
      subscriptionsServiceItemsTable,
      `${subscriptionsServiceItemsTable}.id`,
      `${TABLE_NAME}.subscriptionServiceItemId`,
    )
    .innerJoin(`"${billableServicesHT}" as osht`, 'osht.id', `${TABLE_NAME}.billableServiceId`)
    .innerJoin(
      `"${billableServicesHT}" as isht`,
      'isht.id',
      `${subscriptionsServiceItemsTable}.billableServiceId`,
    )
    .leftJoin(
      `"${materialsHT}" as serviceItemMaterial`,
      'serviceItemMaterial.id',
      `${subscriptionsServiceItemsTable}.materialId`,
    )
    .leftJoin(`"${materialsHT}" as orderMaterial`, 'orderMaterial.id', `${TABLE_NAME}.materialId`)
    .leftJoin(globalRateHT, `${globalRateHT}.id`, `${TABLE_NAME}.globalRatesServicesId`)
    .leftJoin(customRateHT, `${customRateHT}.id`, `${TABLE_NAME}.customRatesGroupServicesId`)
    .leftJoin(thirdPartyHT, `${thirdPartyHT}.id`, `${TABLE_NAME}.thirdPartyHaulerId`)
    .leftJoin(permitHT, `${permitHT}.id`, `${TABLE_NAME}.permitId`)
    .leftJoin(`"${contactsHT}" as jcht`, 'jcht.id', `${TABLE_NAME}.jobSiteContactId`)
    .leftJoin(`"${contactsHT}" as scht`, 'scht.id', `${TABLE_NAME}.subscriptionContactId`)
    .innerJoin(
      subscriptionsTable,
      `${subscriptionsTable}.id`,
      `${subscriptionsServiceItemsTable}.subscriptionId`,
    )
    .leftJoin(customRateGroupHT, `${customRateGroupHT}.id`, `${TABLE_NAME}.customRatesGroupId`)
    .innerJoin(businessLineTable, `${businessLineTable}.id`, `${subscriptionsTable}.businessLineId`)
    .innerJoin(jobSiteHT, `${jobSiteHT}.id`, `${subscriptionsTable}.jobSiteId`)
    .innerJoin(`"${jobSiteHT}" as subjobsite`, 'subjobsite.id', `${subscriptionsTable}.jobSiteId`)
    .leftJoin(
      `"${jobSiteHT}" as destjobsite`,
      'destjobsite.id',
      `${TABLE_NAME}.destinationJobSiteId`,
    )
    .innerJoin(customerHT, `${customerHT}.id`, `${subscriptionsTable}.customerId`)
    .whereNull('deletedAt')
    .leftJoin(
      PurchaseOrderRepo.TABLE_NAME,
      `${TABLE_NAME}.purchaseOrderId`,
      `${PurchaseOrderRepo.TABLE_NAME}.id`,
    )
    .where(unambiguousCondition(TABLE_NAME, condition));

  if (whereIn.length) {
    whereIn.forEach(({ key, values }) => {
      query = query.whereIn(key, values);
    });
  }

  return query.first();
};
