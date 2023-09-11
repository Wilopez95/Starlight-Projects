/* eslint-disable complexity */ // disabled because it will need a huge refactor
import { startOfToday } from 'date-fns';

import SubscriptionRepo from '../../subscription/subscription.js';
import SubscriptionOrderRepo from '../../subscriptionOrder/subscriptionOrder.js';
import JobSitesRepo from '../../jobSite.js';
import BillableServiceRepo from '../../billableService.js';
import BillableLineItemRepo from '../../billableLineItem.js';
import EquipmentItemsRepo from '../../equipmentItem.js';
import MaterialRepo from '../../material.js';
import FrequencyRepo from '../../frequency.js';
import SubscriptionLineItemRepo from '../../subscriptionLineItem.js';
import CustomersRepo from '../../customer.js';
import ServiceAreaRepo from '../../serviceArea.js';
import BillableServiceInclusionRepo from '../../billableServiceInclusion.js';

import { unambiguousCondition, unambiguousSelect } from '../../../utils/dbHelpers.js';

import {
  TABLE_NAME,
  serviceItemGridFields,
  serviceItemNestedFields,
  serviceItemNestedTables,
} from '../../../consts/subscriptionServiceItems.js';
import { ACTION } from '../../../consts/actions.js';

const subsLineItemTable = SubscriptionLineItemRepo.TABLE_NAME;

export const getListQuery = (
  trx,
  ctxState,
  schemaName,
  {
    condition: { ids, subscriptionId, subscriptionsIds, ...condition } = {},
    fields = serviceItemGridFields,
    extraJoins = new Set(),
    excludeNotService = true,
    excludeEnded = true,
  },
) => {
  const billableServicesHT = BillableServiceRepo.getHistoricalTableName();
  const billableLineItemHT = BillableLineItemRepo.getHistoricalTableName();
  const materialsHT = MaterialRepo.getHistoricalTableName();
  const jobSiteHT = JobSitesRepo.getHistoricalTableName();
  const customerHT = CustomersRepo.getHistoricalTableName();
  const serviceAreaHT = ServiceAreaRepo.getHistoricalTableName();

  const whereCondition = unambiguousCondition(TABLE_NAME, condition);

  const columns = fields.filter(
    field =>
      !serviceItemNestedFields.has(field) && !serviceItemNestedTables.has(field.split('.')[0]),
  );
  const nestedColumns = new Set([
    ...Array.from(extraJoins),
    ...fields.filter(
      field =>
        serviceItemNestedFields.has(field) || serviceItemNestedTables.has(field.split('.')[0]),
    ),
    ...Object.keys(condition).filter(
      field =>
        serviceItemNestedFields.has(field) || serviceItemNestedTables.has(field.split('.')[0]),
    ),
  ]);

  const selects = [...unambiguousSelect(TABLE_NAME, columns)];

  const IncludedServicesJoinedTable = 'bsis';
  let includedServicesAggregatedTable;
  if (nestedColumns.has('billableService.services')) {
    includedServicesAggregatedTable = BillableServiceInclusionRepo.getInstance(
      ctxState,
    ).getAggregatedIncludedServicesTable({ joinAs: IncludedServicesJoinedTable }, trx);
  }

  nestedColumns.has('subscription') &&
    selects.push(trx.raw('to_json(??.*) as ??', [SubscriptionRepo.TABLE_NAME, 'subscription']));
  nestedColumns.has('jobSite') &&
    selects.push(trx.raw('to_json(??.*) as ??', [JobSitesRepo.TABLE_NAME, 'jobSite']));
  (nestedColumns.has('material') || nestedColumns.has('materialOriginalId')) &&
    selects.push(trx.raw('to_json(??.*) as ??', [materialsHT, 'material']));
  nestedColumns.has('serviceFrequency') &&
    selects.push(
      trx.raw('first(to_json(??.*)) as ??', [FrequencyRepo.TABLE_NAME, 'serviceFrequency']),
    );
  nestedColumns.has('lineItems') &&
    selects.push(trx.raw('json_agg(distinct ??.*) as ??', [subsLineItemTable, 'lineItems']));
  nestedColumns.has('billableLineItems') &&
    selects.push(
      trx.raw('json_agg(distinct ??.*) as ??', [billableLineItemHT, 'billableLineItems']),
    );
  nestedColumns.has('billableService') &&
    selects.push(trx.raw('to_json(??.*) as ??', ['serviceItemService', 'billableService']));
  nestedColumns.has('billableService') &&
    nestedColumns.has('billableService.services') &&
    selects.push(`${IncludedServicesJoinedTable}.services`);
  if (nestedColumns.has('subscriptionOrders')) {
    if (nestedColumns.has('subscriptionOrders.billableService')) {
      selects.push(
        trx.raw('json_agg(distinct ??.*) as ??', [
          SubscriptionOrderRepo.TABLE_NAME,
          'subscriptionOrders',
        ]),
        trx.raw('json_agg(distinct ??.*) as ??', ['orderService', 'subscriptionOrdersServices']),
      );
    } else {
      selects.push(
        trx.raw('json_agg(distinct ??.*) as ??', [
          SubscriptionOrderRepo.TABLE_NAME,
          'subscriptionOrders',
        ]),
      );
    }
  }
  nestedColumns.has('customerOriginalId') &&
    selects.push(trx.raw('??.original_id as ??', [customerHT, 'customerOriginalId']));
  nestedColumns.has('serviceAreaOriginalId') &&
    selects.push(trx.raw('??.original_id as ??', [serviceAreaHT, 'serviceAreaOriginalId']));
  nestedColumns.has('materialOriginalId') &&
    selects.push(trx.raw('??.original_id as ??', [materialsHT, 'materialOriginalId']));
  nestedColumns.has('nextBillingPeriodFrom') &&
    selects.push(`${SubscriptionRepo.TABLE_NAME}.nextBillingPeriodFrom`);

  const joins = [];
  if (
    nestedColumns.has('serviceItemService') ||
    nestedColumns.has('billableService') ||
    nestedColumns.has('billableService.services') ||
    nestedColumns.has(EquipmentItemsRepo.TABLE_NAME) ||
    nestedColumns.has('equipment') ||
    excludeNotService
  ) {
    joins.push(qb =>
      qb.innerJoin(
        `"${billableServicesHT}" as serviceItemService`,
        'serviceItemService.id',
        `${TABLE_NAME}.billableServiceId`,
      ),
    );
  }
  if (nestedColumns.has('billableService.services')) {
    joins.push(qb =>
      qb.leftJoin(
        includedServicesAggregatedTable,
        `${IncludedServicesJoinedTable}.billableServiceId`,
        'serviceItemService.originalId',
      ),
    );
  }

  let query = trx(TABLE_NAME).withSchema(schemaName).select(selects).where(whereCondition);

  if (nestedColumns.size) {
    (nestedColumns.has(SubscriptionRepo.TABLE_NAME) ||
      nestedColumns.has(jobSiteHT) ||
      nestedColumns.has('subscription') ||
      nestedColumns.has('customerOriginalId') ||
      nestedColumns.has('serviceAreaOriginalId') ||
      nestedColumns.has('jobSite') ||
      nestedColumns.has('nextBillingPeriodFrom')) &&
      joins.push(qb =>
        qb.innerJoin(
          SubscriptionRepo.TABLE_NAME,
          `${SubscriptionRepo.TABLE_NAME}.id`,
          `${TABLE_NAME}.subscriptionId`,
        ),
      );
    (nestedColumns.has(jobSiteHT) || nestedColumns.has('jobSite')) &&
      joins.push(qb =>
        qb
          .innerJoin(jobSiteHT, `${jobSiteHT}.id`, `${SubscriptionRepo.TABLE_NAME}.jobSiteId`)
          .innerJoin(
            JobSitesRepo.TABLE_NAME,
            `${jobSiteHT}.originalId`,
            `${JobSitesRepo.TABLE_NAME}.id`,
          ),
      );
    (nestedColumns.has(EquipmentItemsRepo.TABLE_NAME) || nestedColumns.has('equipment')) &&
      joins.push(qb =>
        qb.innerJoin(
          EquipmentItemsRepo.TABLE_NAME,
          `${EquipmentItemsRepo.TABLE_NAME}.id`,
          `serviceItemService.equipmentItemId`,
        ),
      );
    (nestedColumns.has('material') || nestedColumns.has('materialOriginalId')) &&
      joins.push(qb => qb.leftJoin(materialsHT, `${materialsHT}.id`, `${TABLE_NAME}.materialId`));
    nestedColumns.has('serviceFrequency') &&
      joins.push(qb =>
        qb.leftJoin(
          FrequencyRepo.TABLE_NAME,
          `${FrequencyRepo.TABLE_NAME}.id`,
          `${TABLE_NAME}.serviceFrequencyId`,
        ),
      );
    nestedColumns.has('lineItems') &&
      joins.push(qb =>
        qb.joinRaw(
          `
                    LEFT JOIN "${schemaName}"."${subsLineItemTable}"
                    ON "${subsLineItemTable}".subscription_service_item_id = "${TABLE_NAME}".id
                    AND (
                        "${subsLineItemTable}".end_date IS NULL
                        OR
                        "${subsLineItemTable}".end_date > CURRENT_DATE
                    )
                `,
        ),
      );
    nestedColumns.has('billableLineItems') &&
      joins.push(qb =>
        qb.leftJoin(
          billableLineItemHT,
          `${billableLineItemHT}.id`,
          `${subsLineItemTable}.billableLineItemId`,
        ),
      );
    if (nestedColumns.has('subscriptionOrders')) {
      joins.push(qb =>
        qb.joinRaw(
          `
                    left join "${schemaName}"."${SubscriptionOrderRepo.TABLE_NAME}"
                    on "${SubscriptionOrderRepo.TABLE_NAME}".subscription_service_item_id
                    = "${TABLE_NAME}".id
                    and ("${SubscriptionOrderRepo.TABLE_NAME}".deleted_at is null)
                    and ("${SubscriptionOrderRepo.TABLE_NAME}".one_time = true)
                `,
        ),
      );

      nestedColumns.has('subscriptionOrders.billableService') &&
        joins.push(qb =>
          qb.leftJoin(
            `"${billableServicesHT}" as orderService`,
            'orderService.id',
            `${SubscriptionOrderRepo.TABLE_NAME}.billableServiceId`,
          ),
        );
    }
    nestedColumns.has('customerOriginalId') &&
      joins.push(qb =>
        qb.innerJoin(customerHT, `${SubscriptionRepo.TABLE_NAME}.customerId`, `${customerHT}.id`),
      );
    nestedColumns.has('serviceAreaOriginalId') &&
      joins.push(qb =>
        qb.leftJoin(
          serviceAreaHT,
          `${SubscriptionRepo.TABLE_NAME}.serviceAreaId`,
          `${serviceAreaHT}.id`,
        ),
      );

    const groupColumns = [];
    (nestedColumns.has(SubscriptionRepo.TABLE_NAME) ||
      nestedColumns.has(jobSiteHT) ||
      nestedColumns.has('subscription') ||
      nestedColumns.has('jobSite')) &&
      groupColumns.push(`${SubscriptionRepo.TABLE_NAME}.id`);
    (nestedColumns.has(jobSiteHT) || nestedColumns.has('jobSite')) &&
      groupColumns.push(`${jobSiteHT}.id`, `${JobSitesRepo.TABLE_NAME}.id`);
    (nestedColumns.has('serviceItemService') ||
      nestedColumns.has('billableService') ||
      nestedColumns.has('billableService.services') ||
      nestedColumns.has(EquipmentItemsRepo.TABLE_NAME) ||
      nestedColumns.has('equipment')) &&
      groupColumns.push(`serviceItemService.id`);
    nestedColumns.has('billableService.services') && groupColumns.push(`bsis.services`);
    (nestedColumns.has(EquipmentItemsRepo.TABLE_NAME) || nestedColumns.has('equipment')) &&
      groupColumns.push(`${EquipmentItemsRepo.TABLE_NAME}.id`);
    (nestedColumns.has('material') || nestedColumns.has('materialOriginalId')) &&
      groupColumns.push(`${materialsHT}.id`);
    nestedColumns.has('customerOriginalId') && groupColumns.push(`${customerHT}.id`);
    nestedColumns.has('serviceAreaOriginalId') && groupColumns.push(`${serviceAreaHT}.id`);
    nestedColumns.has('nextBillingPeriodFrom') &&
      groupColumns.push(`${SubscriptionRepo.TABLE_NAME}.id`);
    groupColumns.push(`${TABLE_NAME}.id`);
    query = query.groupBy(groupColumns);
  }

  query = joins.reduce((qb, join) => join(qb), query);

  if (excludeEnded) {
    query = query.andWhere(builder =>
      builder
        .whereNull(`${TABLE_NAME}.endDate`)
        .orWhere(`${TABLE_NAME}.endDate`, '>', startOfToday()),
    );
  }

  if (excludeNotService) {
    query = query.whereNot(`serviceItemService.action`, ACTION.notService);
  }

  if (ids) {
    query = query.whereIn(`${TABLE_NAME}.id`, ids);
  }

  if (subscriptionId) {
    query = query.where(`${TABLE_NAME}.subscriptionId`, subscriptionId);
  }

  if (subscriptionsIds) {
    query = query.whereIn(`${TABLE_NAME}.subscriptionId`, subscriptionsIds);
  }

  return query;
};
