import has from 'lodash/has.js';

import SubscriptionServiceItemRepo from '../../subscriptionServiceItem/subscriptionServiceItem.js';
import SubscriptionRepo from '../../subscription/subscription.js';
import CustomerRepo from '../../customer.js';
import BusinessLineRepo from '../../businessLine.js';
import BusinessUnitRepo from '../../businessUnit.js';
import JobSiteRepo from '../../jobSite.js';
import BillableServiceRepo from '../../billableService.js';
import MaterialRepo from '../../material.js';
import ThirdPartyHaulerRepo from '../../3rdPartyHaulers.js';
import CustomRatesGroupRepo from '../../customRatesGroup.js';
import PermitRepo from '../../permit.js';

import { TABLE_NAME, subscriptionsOrderGridFields } from '../../../consts/subscriptionOrders.js';
import { unambiguousSelect } from '../../../utils/dbHelpers.js';

import {
  SEPARATELY_SORTED_SUBSCRIPTION_ORDERS_KEYS,
  SUBSCRIPTION_ORDERS_DEFAULT_SORTING,
} from '../../../consts/subscriptionAttributes.js';
import { SUBSCRIPTION_ORDER_STATUS } from '../../../consts/orderStatuses.js';
import { SUBSCRIPTION_STATUS } from '../../../consts/subscriptionStatuses.js';
import { getNeedsApprovalSelect } from './getNeedsApprovalSelect.js';
import { applySearchToQuery } from './applySearchToQuery.js';

export const getListQuery = (
  trx,
  schemaName,
  {
    condition: {
      businessUnitId,
      subscriptionId,
      status,
      filterByServiceDateFrom,
      filterByServiceDateTo,
      filterByBusinessLine,
      searchId,
      searchQuery,
      omitDraft,
      ...additionalFilters
    },
    sortBy = SUBSCRIPTION_ORDERS_DEFAULT_SORTING,
    fields = subscriptionsOrderGridFields,
  },
) => {
  const subscriptionsServiceItemsTable = SubscriptionServiceItemRepo.TABLE_NAME;
  const billableServicesHT = BillableServiceRepo.getHistoricalTableName();
  const materialsHT = MaterialRepo.getHistoricalTableName();
  const thirdPartyHT = ThirdPartyHaulerRepo.getHistoricalTableName();

  const subscriptionsTable = SubscriptionRepo.TABLE_NAME;
  const jobSiteHT = JobSiteRepo.getHistoricalTableName();
  const businessLineTable = BusinessLineRepo.TABLE_NAME;
  const businessUnitTable = BusinessUnitRepo.TABLE_NAME;
  const customerHT = CustomerRepo.getHistoricalTableName();
  const permitHT = PermitRepo.getHistoricalTableName();
  const customRateGroupHT = CustomRatesGroupRepo.getHistoricalTableName();

  const selects = [];
  selects.push(
    ...unambiguousSelect(TABLE_NAME, fields),
    trx.raw('to_json(??.*) as ??', [subscriptionsServiceItemsTable, 'subscriptionServiceItem']),
    trx.raw('to_json(??.*) as ??', ['osht', 'orderBillableService']),
    trx.raw('to_json(??.*) as ??', ['isht', 'itemBillableService']),
    trx.raw('to_json(??.*) as ??', [materialsHT, 'material']),
    trx.raw('to_json(??.*) as ??', [jobSiteHT, 'jobSite']),
    trx.raw('to_json(??.*) as ??', [businessUnitTable, 'businessUnit']),
    trx.raw('to_json(??.*) as ??', [businessLineTable, 'businessLine']),
    trx.raw('to_json(??.*) as ??', [customerHT, 'customer']),
    trx.raw('??.?? as ??', [thirdPartyHT, 'description', 'thirdPartyHaulerDescription']),
    trx.raw('to_json(??.*) as ??', [customRateGroupHT, 'customRatesGroup']),
    trx.raw('to_json(??.*) as ??', [permitHT, 'permit']),
  );

  selects.push(trx.raw(`${getNeedsApprovalSelect()} as ??`, 'status'));

  const groupColumns = [
    `${subscriptionsTable}.id`,
    `${subscriptionsServiceItemsTable}.id`,
    `osht.id`,
  ];

  if (sortBy === SEPARATELY_SORTED_SUBSCRIPTION_ORDERS_KEYS.status) {
    groupColumns.push(`${TABLE_NAME}.status`);
  }

  groupColumns.push(
    `isht.id`,
    `${customerHT}.id`,
    `${businessUnitTable}.id`,
    `${businessLineTable}.id`,
    `${jobSiteHT}.id`,
    `${materialsHT}.id`,
    `${thirdPartyHT}.id`,
    `${TABLE_NAME}.id`,
    `${customRateGroupHT}.id`,
    `${permitHT}.id`,
  );

  let query = trx(TABLE_NAME)
    .withSchema(schemaName)
    .select(selects)
    .whereNull('deletedAt')
    .innerJoin(
      subscriptionsServiceItemsTable,
      `${subscriptionsServiceItemsTable}.id`,
      `${TABLE_NAME}.subscriptionServiceItemId`,
    )
    .innerJoin(
      subscriptionsTable,
      `${subscriptionsTable}.id`,
      `${subscriptionsServiceItemsTable}.subscriptionId`,
    )
    .innerJoin(businessUnitTable, `${businessUnitTable}.id`, `${subscriptionsTable}.businessUnitId`)
    .innerJoin(businessLineTable, `${businessLineTable}.id`, `${subscriptionsTable}.businessLineId`)
    .innerJoin(jobSiteHT, `${jobSiteHT}.id`, `${subscriptionsTable}.jobSiteId`)
    .innerJoin(customerHT, `${customerHT}.id`, `${subscriptionsTable}.customerId`)
    .innerJoin(`"${billableServicesHT}" as osht`, 'osht.id', `${TABLE_NAME}.billableServiceId`)
    .innerJoin(
      `"${billableServicesHT}" as isht`,
      'isht.id',
      `${subscriptionsServiceItemsTable}.billableServiceId`,
    )
    .leftJoin(materialsHT, `${TABLE_NAME}.materialId`, `${materialsHT}.id`)
    .leftJoin(thirdPartyHT, `${TABLE_NAME}.thirdPartyHaulerId`, `${thirdPartyHT}.id`)
    .leftJoin(permitHT, `${permitHT}.id`, `${TABLE_NAME}.permitId`)
    .leftJoin(
      customRateGroupHT,
      `${customRateGroupHT}.id`,
      `${subscriptionsTable}.customRatesGroupId`,
    )
    .groupBy(groupColumns);

  if (subscriptionId) {
    query = query.where(`${subscriptionsServiceItemsTable}.subscriptionId`, subscriptionId);
  }
  if (businessUnitId) {
    query = query.andWhere(`${subscriptionsTable}.businessUnitId`, businessUnitId);
  }

  const isCompletedApproved = additionalFilters.needsApproval && additionalFilters.completed;

  if (!isCompletedApproved && has(additionalFilters, 'needsApproval')) {
    query = query.andWhereRaw(
      `${getNeedsApprovalSelect()} ${additionalFilters.needsApproval ? '=' : '!='} '${
        SUBSCRIPTION_ORDER_STATUS.needsApproval
      }'`,
    );
  }

  if (!isCompletedApproved && has(additionalFilters, 'completed')) {
    query = query.andWhereRaw(
      `${getNeedsApprovalSelect()} ${additionalFilters.completed ? '=' : '!='} '${
        SUBSCRIPTION_ORDER_STATUS.completed
      }'`,
    );
  }

  if (isCompletedApproved) {
    query = query.andWhere(`${TABLE_NAME}.status`, SUBSCRIPTION_ORDER_STATUS.completed);
  }
  if (status) {
    const statuses = [status];
    if (status === SUBSCRIPTION_ORDER_STATUS.finalized) {
      statuses.push(SUBSCRIPTION_ORDER_STATUS.canceled);
    }

    query = query.whereIn(`${TABLE_NAME}.status`, statuses);
  }
  if (filterByServiceDateFrom) {
    query = query.andWhere(`${TABLE_NAME}.serviceDate`, '>=', filterByServiceDateFrom);
  }
  if (filterByServiceDateTo) {
    query = query.andWhere(`${TABLE_NAME}.serviceDate`, '<=', filterByServiceDateTo);
  }
  if (Array.isArray(filterByBusinessLine)) {
    query = query.whereIn(`${subscriptionsTable}.businessLineId`, filterByBusinessLine);
  }
  if (omitDraft) {
    query = query.whereNot(`${subscriptionsTable}.status`, SUBSCRIPTION_STATUS.draft);
  }

  return applySearchToQuery(query, { searchId, searchQuery });
};
