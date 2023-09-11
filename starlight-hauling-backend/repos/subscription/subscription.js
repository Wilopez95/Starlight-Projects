import { Readable } from 'stream';
import { startOfToday, addDays } from 'date-fns';
import isEmpty from 'lodash/isEmpty.js';
import omit from 'lodash/omit.js';
import map from 'lodash/map.js';
import groupBy from 'lodash/groupBy.js';
import find from 'lodash/find.js';
import pick from 'lodash/fp/pick.js';

import VersionedRepository from '../_versioned.js';
import CustomerRepo from '../customer.js';
import PhoneNumberRepo from '../phoneNumber.js';
import ContactRepo from '../contact.js';
import CustomerGroupRepository from '../customerGroup.js';
import SubscriptionServiceItemRepo from '../subscriptionServiceItem/subscriptionServiceItem.js';
import SubscriptionLineItemRepo from '../subscriptionLineItem.js';
import SubscriptionOrderRepo from '../subscriptionOrder/subscriptionOrder.js';
import SubscriptionWorkOrderRepo from '../subscriptionWorkOrder.js';
import BillableServiceRepo from '../billableService.js';
import BillableLineItemRepo from '../billableLineItem.js';
import JobSiteRepo from '../jobSite.js';
import SubscriptionOrderLineItemRepo from '../subscriptionOrderLineItem.js';

import { subscriptionServiceName } from '../../services/subscriptions/utils/subscriptionServiceName.js';
import { aggregateSubscriptionServiceFrequency } from '../../services/subscriptions/utils/aggregateSubscriptionServiceFrequency.js';
import { getFrequencyDescription } from '../../services/subscriptions/utils/getFrequencyDescription.js';
import { getLinkedHistoricalIds } from '../../services/subscriptions/getLinkedHistoricalIds.js';

import { unambiguousSelect, unambiguousCondition } from '../../utils/dbHelpers.js';
import { joinAddress } from '../../utils/joinAddress.js';

import {
  TABLE_NAME,
  subscriptionFieldsForInvoicing,
  expiredSubsFields,
  districtTypeSortOrder,
  SUBSCRIPTION_FIELDS_FOR_INDEX,
} from '../../consts/subscriptions.js';
import { SUBSCRIPTION_STATUS } from '../../consts/subscriptionStatuses.js';
import { SUBSCRIPTION_ORDER_STATUS } from '../../consts/orderStatuses.js';
import { BILLING_TYPES } from '../../consts/billingTypes.js';
import { SUBSCRIPTION_WO_STATUS } from '../../consts/workOrder.js';
import {
  pricingCloseEndingSubscriptions,
  pricingGetSubscriptionServiceItemById,
  pricingGetSubscriptionsCount,
  pricingGetEndingSubscriptions,
  pricingGetNextServiceBySubscriptionId,
  pricingGetSubscriptionsToInvoice,
  pricingAlterSubscriptions,
} from '../../services/pricing.js';
import { mapSubscriptionFromDb } from './utils/mapSubscriptionFromDb.js';
import { populateDataQuery } from './queries/populateDataQuery.js';
import { getByConditionQuery } from './queries/getByConditionQuery.js';
import { getAllPaginatedQuery } from './queries/getAllPaginatedQuery.js';
import { getByIdQuery } from './queries/getByIdQuery.js';
import { applyCommonFilters } from './queries/applyCommonFilters.js';
import { getAvailableFilters } from './queries/getAvailableFilters.js';

class SubscriptionsRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  getCtx() {
    return {
      state: this.ctxState,
      logger: this.ctxState.logger,
    };
  }

  mapFields(originalObj) {
    return mapSubscriptionFromDb(originalObj, {
      // in case if will be copy-pasted and `this` will be used in parent
      parentMapper: super.mapFields.bind(this),
      instance: this,
    });
  }

  mapFieldsToIndex({ customer, jobSite, ...subscription }) {
    const mapped = pick(SUBSCRIPTION_FIELDS_FOR_INDEX)({
      ...subscription,
      customer,
      jobSite,
      jobSiteAddress: joinAddress(jobSite?.address),
      serviceFrequencyAggregated: JSON.stringify(subscription.serviceFrequencyAggregated),
      customerBusinessName: customer?.businessName,
      customerFullName: `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim(),
      businessUnitId: subscription.businessUnitId,
      businessLineId: subscription.businessLineId,
    });
    return mapped;
  }

  // to be used externally
  getLinkedHistoricalIds(linkedData, { entityId } = {}, trx = this.knex) {
    return getLinkedHistoricalIds(trx, this.schemaName, this.constructor.getHistoricalTableName, {
      linkedData,
      existingItem: (entityId && { id: entityId }) || null,
    });
  }

  async getAllForHold({ customerId, status }, trx) {
    const customersHT = CustomerRepo.getHistoricalTableName();
    const result = await trx(this.tableName)
      .withSchema(this.schemaName)
      .innerJoin(customersHT, `${customersHT}.id`, `${this.tableName}.customerId`)
      .where(`${this.tableName}.status`, status)
      .andWhere(`${customersHT}.originalId`, customerId)
      .select([`${this.tableName}.id`]);

    return result || [];
  }

  getAvailableFilters(trx = this.knex) {
    return getAvailableFilters(trx, this.tableName, this.schemaName);
  }

  applyCommonFilters(filters, query) {
    return applyCommonFilters(this.tableName, filters, query);
  }

  async getAllPaginated(
    { condition, skip, limit, sortBy, sortOrder, fields } = {},
    trx = this.knex,
  ) {
    const subsServiceItemRepo = SubscriptionServiceItemRepo.getInstance(this.ctxState);
    let query = getAllPaginatedQuery(trx, this.tableName, this.schemaName, {
      condition,
      fields,
      sortBy,
      sortOrder,
      skip,
      limit,
    });

    query = this.applyCommonFilters(condition, query);

    const items = await query;
    if (isEmpty(items)) {
      return [];
    }

    const subscriptionIds = map(items, 'id');

    const [serviceItems, nextServiceDates] = await Promise.all([
      subsServiceItemRepo.getBySubscriptionIds({ ids: subscriptionIds }),
      subsServiceItemRepo.getNextServiceDatesBySubscriptionIds(subscriptionIds),
    ]);

    const nextServiceDatesMap = nextServiceDates.reduce((result, item) => {
      result[item.id] = item.nextServiceDate;
      return result;
    }, {});

    if (serviceItems?.length) {
      const serviceItemsMap = groupBy(serviceItems, 'subscriptionId');
      items.forEach(item => {
        if (serviceItemsMap[item.id]) {
          item.serviceName = subscriptionServiceName(serviceItemsMap[item.id]);
          item.serviceFrequencyAggregated = aggregateSubscriptionServiceFrequency(
            serviceItemsMap[item.id],
          );
          item.nextServiceDate = nextServiceDatesMap[item.id] || null;
        }
      });
    }

    return items.map(this.mapFields.bind(this));
  }

  // pre-pricing service code:
  // async count({ condition = {} } = {}, trx = this.knex) {
  //   const [total, ...countByStatus] = await Promise.all([
  //     countFiltered(this.schemaName, trx, { condition }),
  //     ...SUBSCRIPTION_STATUSES.map(
  //       status => countFiltered(this.schemaName, trx, { condition: { ...condition, status } }),
  //       this,
  //     ),
  //   ]);

  //   return {
  //     total,
  //     statuses: SUBSCRIPTION_STATUSES.reduce(
  //       (obj, status, i) => Object.assign(obj, { [status]: countByStatus[i] }),
  //       {},
  //     ),
  //   };
  // end of pre-pricing service code
  async count({ condition = {} } = {}) {
    return await pricingGetSubscriptionsCount(this.getCtx(), { data: condition });
  }

  async attachSubscriptionPhoneNumbers({ subscription }) {
    if (subscription?.subscriptionContact?.originalId) {
      subscription.subscriptionContact.phoneNumbers = await PhoneNumberRepo.getInstance(
        this.ctxState,
      ).getByContactId(subscription.subscriptionContact.originalId);
    }
  }

  // eslint-disable-next-line no-unused-vars
  async attachSubscriptionServices({ subscription }, trx = this.knex) {
    const subsServiceItemRepo = SubscriptionServiceItemRepo.getInstance(this.ctxState);
    let serviceItems, nextServiceDates;

    // pre-pricing service code:
    // const [serviceItems, nextServiceDates] = await Promise.all([
    //   subsServiceItemRepo.getBySubscriptionId(
    //     { subscriptionId: subscription.id, extraJoins: ['billableService.services'] },
    //     trx,
    //   ),
    //   subsServiceItemRepo.getNextServiceDatesBySubscriptionIds([subscription.id], trx),
    // ]);
    // end of pre-pricing service code
    if (!subscription.serviceItems || !subscription.nextServiceDates) {
      serviceItems = await pricingGetSubscriptionServiceItemById(this.getCtx(), {
        data: { id: subscription.id },
      });
      nextServiceDates = await pricingGetNextServiceBySubscriptionId(this.getCtx(), {
        data: { id: subscription.id },
      });
    } else {
      serviceItems = subscription.serviceItems;
      nextServiceDates = subscription.nextServiceDates;
    }

    if (serviceItems?.length) {
      subscription.serviceName = subscriptionServiceName(serviceItems);
      subscription.serviceFrequencyAggregated = aggregateSubscriptionServiceFrequency(serviceItems);
      subscription.serviceItems = serviceItems.map(
        subsServiceItemRepo.mapFields.bind(subsServiceItemRepo),
      );
      // pre-pricing service code:
      // subscription.nextServiceDate = nextServiceDates?.[0]?.nextServiceDate || null;
      // end of pre-pricing service code
      subscription.nextServiceDate = nextServiceDates?.serviceDate || null;
    } else {
      subscription.serviceItems = [];
    }
  }

  async attachTaxDistricts({ subscription }, trx = this.knex) {
    const { customerJobSite, businessLine } = subscription;
    const jobSiteId = customerJobSite?.jobSiteId;

    if (jobSiteId) {
      const taxDistricts = (
        await JobSiteRepo.getInstance(this.ctxState).getDefaultTaxDistricts(
          {
            activeOnly: true,
            jobSiteId,
          },
          trx,
        )
      )
        .map(taxDistrict => {
          taxDistrict.districtOrder = districtTypeSortOrder[taxDistrict.districtType];
          taxDistrict.taxConfigs = find(taxDistrict.businessConfiguration, {
            businessLineId: businessLine.id,
          });
          return taxDistrict;
        })
        .sort((left, right) => left.districtOrder - right.districtOrder)
        .map(taxDistrict =>
          omit(taxDistrict, [
            'bbox',
            'businessLineTaxesIds',
            'businessConfiguration',
            'districtOrder',
          ]),
        );

      subscription.taxDistricts = taxDistricts.map(({ districtName }) => ({ districtName }));
    }
  }

  streamAllData({ serviceData = [] } = {}, _trx = this.knex) {
    /*
      create a fake stream because all the subscriptions should be return from the pricing BE
      serviceData => all the subscriptions from pricing
    */
    const readStream = Readable.from([]);
    serviceData.map(element => {
      readStream.push(element);
      return element;
    });
    return readStream;
  }

  async getByIdPopulated({ id, condition, fields } = {}, trx = this.knex) {
    const query = getByIdQuery(trx, this.tableName, this.schemaName, this.userId, {
      id,
      condition,
      fields,
    });

    const item = await query;

    if (isEmpty(item)) {
      return null;
    }

    const subscription = this.mapFields(item);

    await this.attachSubscriptionPhoneNumbers({ subscription });
    await this.attachSubscriptionServices({ subscription }, trx);
    await this.attachTaxDistricts({ subscription });

    return subscription;
  }

  async updateBy({ condition, insertData }) {
    const { id } = condition;

    const subscription = await pricingAlterSubscriptions(this.getCtx(), { data: insertData }, id);

    if (!subscription?.length) {
      return [];
    }

    return subscription;
  }

  async getBy({ condition, fields } = {}, skip, limit, trx = this.knex) {
    const query = getByConditionQuery(trx, this.tableName, this.schemaName, {
      condition,
      fields,
      skip,
      limit,
    });

    const items = await query;

    if (!items?.length) {
      return [];
    }

    return items.map(this.mapFields.bind(this));
  }

  // pre-pricing service code:
  // async updateServiceFrequencyDescription(
  //   { id: subscriptionId, oldValue = null } = {},
  //   trx = this.knex,
  // ) {
  //   const serviceItems = await SubscriptionServiceItemRepo.getInstance(
  //     this.ctxState,
  //   ).getBySubscriptionId(
  //     {
  //       subscriptionId,
  //     },
  //     trx,
  //   );
  // end of pre-pricing service code
  async updateServiceFrequencyDescription({ id: subscriptionId, oldValue = null } = {}) {
    // Get all the subscription service item for the current subscription
    const serviceItems = await pricingGetSubscriptionServiceItemById(this.getCtx(), {
      data: { id: subscriptionId },
    });
    // This is the origil code created by Eleks
    // const serviceItems = await SubscriptionServiceItemRepo.getInstance(this.ctxState).getBySubscriptionId(
    //   {
    //     subscriptionId,
    //   },
    //   trx,
    // );

    const serviceFrequencyAggregated = aggregateSubscriptionServiceFrequency(serviceItems);
    const serviceFrequencyDescription = serviceFrequencyAggregated?.type
      ? getFrequencyDescription(serviceFrequencyAggregated)
      : serviceFrequencyAggregated;

    if (serviceFrequencyDescription !== oldValue) {
      // Update the current Subscription to add the serviceFrecuency Description.
      await pricingAlterSubscriptions(
        this.getCtx(),
        { data: { serviceFrequency: serviceFrequencyDescription } },
        subscriptionId,
      );
      // This is the origil code created by Eleks
      // await super.updateBy(
      //   {
      //     condition: { id: subscriptionId },
      //     data: {
      //       serviceFrequency: serviceFrequencyDescription,
      //     },
      //   },
      //   trx,
      // );
    }
  }

  getAllByIds(
    { ids, statuses = [SUBSCRIPTION_STATUS.active, SUBSCRIPTION_STATUS.onHold], fields = ['*'] },
    trx = this.knex,
  ) {
    return super
      .getAllByIds(
        {
          ids,
          fields,
        },
        trx,
      )
      .whereIn('status', statuses);
  }

  // eslint-disable-next-line no-unused-vars
  async getEndingSubscriptions({ fields = ['*'] }) {
    return await pricingGetEndingSubscriptions(this.getCtx(), {});
    // const result = await this.knex(this.tableName)
    //   .withSchema(this.schemaName)
    //   .whereNot('status', SUBSCRIPTION_STATUS.closed)
    //   .whereNotNull('endDate')
    //   // according https://starlightpro.atlassian.net/browse/HAULING-1217
    //   // we must close subscriptions on the next day after end date
    //   .andWhere('endDate', '<', startOfToday())
    //   .select(fields);

    // return result;
  }

  async getExpiredPeriodSubscriptions({ fields = expiredSubsFields }, trx = this.knex) {
    const now = new Date();

    const query = populateDataQuery(trx, this.tableName, this.schemaName, { fields })
      .whereNot(`${this.tableName}.status`, SUBSCRIPTION_STATUS.closed)
      .whereNotNull(`${this.tableName}.periodTo`)
      .andWhere(builder =>
        builder
          .whereNull(`${this.tableName}.endDate`)
          .orWhere(`${this.tableName}.endDate`, '>', now),
      )
      .andWhere(`${this.tableName}.periodTo`, '<', now);

    const result = await query;

    const subscriptions = result?.map(this.mapFields.bind(this));

    if (!isEmpty(subscriptions)) {
      await Promise.all(
        subscriptions.map(subscription => this.attachSubscriptionServices({ subscription }, trx)),
      );
    }

    return subscriptions;
  }

  async getSoonEndingSubscriptionsWithSalesId({ fields = ['*'], nestedFields = ['salesId'] }) {
    const CustomerHT = CustomerRepo.getHistoricalTableName();
    const result = await this.knex(this.tableName)
      .withSchema(this.schemaName)
      .where('subscriptionEndEmailSent', false)
      .whereNot(`${this.tableName}.status`, SUBSCRIPTION_STATUS.closed)
      .whereNotNull(`${CustomerHT}.salesId`)
      .whereNotNull('endDate')
      .andWhere('endDate', '<', addDays(startOfToday(), 3))
      .select([...unambiguousSelect(this.tableName, fields), ...nestedFields])
      .innerJoin(CustomerHT, `${CustomerHT}.id`, `${this.tableName}.customerId`);

    return result;
  }

  // eslint-disable-next-line no-unused-vars
  async closeSubscriptionsByIds({ ids = [], fields = '*' } = {}, trx = this.knex) {
    // const result = await trx(this.tableName)
    //   .withSchema(this.schemaName)
    //   .update({ status: SUBSCRIPTION_STATUS.closed }, fields)
    //   .whereIn(`${this.tableName}.id`, ids);

    // should implement fields selection later.
    const result = await pricingCloseEndingSubscriptions(this.getCtx(), { data: { ids, fields } });
    return result;
  }

  async getSubscriptionsToNofiyResumeWithSalesId({ fields = ['*'], nestedFields = ['salesId'] }) {
    const CustomerHT = CustomerRepo.getHistoricalTableName();
    const result = await this.knex(this.tableName)
      .withSchema(this.schemaName)
      .whereNotNull(`${CustomerHT}.salesId`)
      .where('subscriptionResumeEmailSent', false)
      .whereNotNull('holdSubscriptionUntil')
      .andWhere('holdSubscriptionUntil', '<', addDays(startOfToday(), 2))
      .select([...unambiguousSelect(this.tableName, fields), ...nestedFields])
      .innerJoin(CustomerHT, `${CustomerHT}.id`, `${this.tableName}.customerId`);

    return result;
  }

  async setSubscriptionResumedSent(subscriptionIds) {
    await this.knex(this.tableName)
      .withSchema(this.schemaName)
      .update({ subscriptionResumeEmailSent: true })
      .whereIn(`${this.tableName}.id`, subscriptionIds);
  }

  async setSubscriptionEndsSoonSent(subscriptionIds) {
    await this.knex(this.tableName)
      .withSchema(this.schemaName)
      .update({ subscriptionEndEmailSent: true })
      .whereIn(`${this.tableName}.id`, subscriptionIds);
  }

  async invoicingCount({ businessUnitId, ...condition } = {}) {
    const customersTable = CustomerRepo.TABLE_NAME;
    const customersHT = CustomerRepo.getHistoricalTableName();
    const subServiceItemTable = SubscriptionServiceItemRepo.TABLE_NAME;
    const subOrderTable = SubscriptionOrderRepo.TABLE_NAME;

    const query = this.addFiltersToQuery(
      this.knex(this.tableName)
        .withSchema(this.schemaName)
        .where(`${this.tableName}.businessUnitId`, businessUnitId)
        .whereIn(`${this.tableName}.status`, [
          SUBSCRIPTION_STATUS.active,
          SUBSCRIPTION_STATUS.closed,
        ])

        .distinctOn(`${this.tableName}.id`)

        .innerJoin(customersHT, `${customersHT}.id`, `${this.tableName}.customerId`)
        .innerJoin(customersTable, `${customersTable}.id`, `${customersHT}.originalId`)

        // TODO: use CTE
        .innerJoin(
          subServiceItemTable,
          `${this.tableName}.id`,
          `${subServiceItemTable}.subscriptionId`,
        )

        .leftJoin(
          subOrderTable,
          `${subServiceItemTable}.id`,
          `${subOrderTable}.subscriptionServiceItemId`,
        )

        .groupBy([`${this.tableName}.id`]),

      {
        ...condition,
      },
    );
    const result = await query.count(`${this.tableName}.id`);
    return { total: result?.length ?? 0 };
  }

  // not for grid
  addFiltersToQuery(originalQuery, condition) {
    const {
      filterByBusinessLine = [],
      customerId,
      arrears,
      inAdvance,
      onAccount,
      customerGroupId,
      prepaid,
      billingCycles = [],
      endingDate,
    } = condition;

    const customersTable = CustomerRepo.TABLE_NAME;
    const subOrderTable = SubscriptionOrderRepo.TABLE_NAME;

    let query = originalQuery;

    query = query
      .whereIn(`${this.tableName}.businessLineId`, filterByBusinessLine)
      .whereIn(`${this.tableName}.billing_cycle`, billingCycles);

    const isBillingType = arrears || inAdvance;

    if (isBillingType) {
      query = query.where(q => {
        let subQuery;

        if (arrears) {
          subQuery = q.where(`${this.tableName}.billing_type`, 'arrears').where(arrearsSubQuery => {
            arrearsSubQuery.where(queryArrears => {
              const tempQuery = queryArrears
                .where(`${this.tableName}.next_billing_period_to`, '<', endingDate)
                .orWhere(subQueryArrears => {
                  const tempSubQuery = subQueryArrears
                    .whereNull(`${this.tableName}.next_billing_period_to`)
                    .whereIn(`${subOrderTable}.status`, [
                      SUBSCRIPTION_ORDER_STATUS.finalized,
                      SUBSCRIPTION_ORDER_STATUS.canceled,
                    ]);
                  return tempSubQuery;
                });
              return tempQuery;
            });
          });
        }

        if (inAdvance) {
          subQuery = q.orWhere(inAdvancedSubQuery => {
            inAdvancedSubQuery
              .where(queryInAdvance => {
                const tempQuery = queryInAdvance
                  .where(`${this.tableName}.next_billing_period_from`, '<=', endingDate)
                  .orWhere(subQueryInAdvance => {
                    const tempSubQuery = subQueryInAdvance
                      .whereNull(`${this.tableName}.next_billing_period_from`)
                      .whereIn(`${subOrderTable}.status`, [
                        SUBSCRIPTION_ORDER_STATUS.finalized,
                        SUBSCRIPTION_ORDER_STATUS.canceled,
                      ]);
                    return tempSubQuery;
                  });
                return tempQuery;
              })
              .where(`${this.tableName}.billing_type`, 'inAdvance');
            return inAdvancedSubQuery;
          });
        }

        return subQuery;
      });
    } else {
      query = query.where(`${this.tableName}.billing_type`, 'arrears');
      query = query.where(`${this.tableName}.billing_type`, 'inAdvance');
    }

    if (customerId) {
      query = query.andWhere(`${customersTable}.id`, customerId);
    } else {
      if (customerGroupId) {
        query = query.andWhere(`${customersTable}.customerGroupId`, customerGroupId);
      }

      if (prepaid !== undefined || onAccount !== undefined) {
        query = this.applyCustomerBillingFilter(query, {
          prepaid,
          onAccount,
        });
      }
    }

    return query;
  }

  applyCustomerBillingFilter(originalQuery, { prepaid, onAccount }) {
    // For customer filters, current values matter.
    const customersTable = CustomerRepo.TABLE_NAME;
    return originalQuery.where(qb => {
      const isBothFalse = !prepaid && !onAccount;
      let builder = qb;
      if (!isBothFalse) {
        builder = builder.where(q => {
          let subQuery;
          if (prepaid) {
            subQuery = q.where(`${customersTable}.onAccount`, false);
          }
          if (onAccount) {
            // when we want see both variant
            subQuery = q.orWhere(`${customersTable}.onAccount`, true);
          }
          return subQuery;
        });
      } else {
        // there are not any customers without prepaid or onAccount
        builder = builder.where(`${customersTable}.onAccount`, true);
        builder = builder.where(`${customersTable}.onAccount`, false);
      }

      return builder;
    });
  }

  getWithTable(condition, businessUnitId, subscriptionCTE) {
    const customersTable = CustomerRepo.TABLE_NAME;
    const subscriptionOrderTable = SubscriptionOrderRepo.TABLE_NAME;
    const subscriptionWorkOrderTable = SubscriptionWorkOrderRepo.TABLE_NAME;
    const subscriptionServiceItemTable = SubscriptionServiceItemRepo.TABLE_NAME;
    const subOrderLineItems = SubscriptionOrderLineItemRepo.TABLE_NAME;

    const customersHT = CustomerRepo.getHistoricalTableName();
    const subscriptionServiceItemHt = SubscriptionServiceItemRepo.getHistoricalTableName();
    const billableServiceHT = BillableServiceRepo.getHistoricalTableName();
    const subscriptionLineItemHt = SubscriptionLineItemRepo.getHistoricalTableName();
    const jobSiteHt = JobSiteRepo.getHistoricalTableName();
    const billableLineItemHt = BillableLineItemRepo.getHistoricalTableName();

    const { schemaName, tableName } = this;

    const billableServiceCTE = 'billable_service_historical_cte';
    const billableLineItemCTE = 'billable_line_items_cte';

    const subsOrdersCTE = 'subscription_orders_cte';
    const subsWorkOrdersCTE = 'subscription_work_orders_cte';
    const lineItemsCTE = 'line_items_cte';
    const serviceItemsCTE = 'service_items_cte';
    const jobSiteCTE = 'job_site_cte';
    const unfinalizedSubsOrdersCTE = 'unfinalized_subscription_orders_cte';
    const subOrderLineItemsCTE = 'subscription_orders_line_items_cte';

    const subscriptionFields = subscriptionFieldsForInvoicing.map(field => `${tableName}.${field}`);

    const query = this.knex
      .with(billableLineItemCTE, qb => {
        qb.select('id', 'description')
          .from(`${schemaName}.${billableLineItemHt}`)
          .orderBy(`${billableLineItemHt}.id`);
      })
      .with(billableServiceCTE, qb => {
        qb.select('proration_type', 'id', 'description', 'action')
          .from(`${schemaName}.${billableServiceHT}`)
          .orderBy(`${billableServiceHT}.id`);
      })
      .with(jobSiteCTE, qb => {
        // TODO get value from original table
        qb.select(
          'id',
          'full_address',
          'address_line_1',
          'city',
          'address_line_2',
          'state',
          'zip',
          'original_id',
        )
          .from(`${schemaName}.${jobSiteHt}`)
          .orderBy(`${jobSiteHt}.id`);
      })
      .with(subOrderLineItemsCTE, qb => {
        qb.select(
          `${subOrderLineItems}.id`,
          `${subOrderLineItems}.price`,
          `${subOrderLineItems}.quantity`,
          `${subOrderLineItems}.subscription_order_id`,
          `${billableLineItemCTE}.description as service_name`,
        )
          .from(`${schemaName}.${subOrderLineItems}`)
          .innerJoin(
            billableLineItemCTE,
            `${billableLineItemCTE}.id`,
            `${subOrderLineItems}.billable_line_item_id`,
          );
      })
      .with(subsOrdersCTE, qb => {
        qb.select(
          `${subscriptionOrderTable}.service_date`,
          `${subscriptionOrderTable}.quantity`,
          `${subscriptionOrderTable}.price`,
          `${subscriptionOrderTable}.subscription_service_item_id`,
          `${subscriptionOrderTable}.id`,
          `${subscriptionOrderTable}.grand_total`,
          `${subscriptionOrderTable}.sequence_id`,
          `${subscriptionOrderTable}.status`,
          `${tableName}.job_site_id`,

          `${billableServiceCTE}.description as service_name`,
          `${billableServiceCTE}.action`,

          this.knex.raw(
            `COALESCE(
                            jsonb_agg(distinct ${subOrderLineItemsCTE}.*)
                            FILTER (WHERE ${subOrderLineItemsCTE}.id IS NOT NULL),
                         '[]'
                         ) as sub_order_line_items`,
          ),
        )
          .from(`${schemaName}.${subscriptionOrderTable}`)

          .innerJoin(
            billableServiceCTE,
            `${billableServiceCTE}.id`,
            `${subscriptionOrderTable}.billable_service_id`,
          )

          .leftJoin(
            subOrderLineItemsCTE,
            `${subscriptionOrderTable}.id`,
            `${subOrderLineItemsCTE}.subscription_order_id`,
          )

          .innerJoin(
            `${schemaName}.${subscriptionServiceItemTable}`,
            `${subscriptionServiceItemTable}.id`,
            `${subscriptionOrderTable}.subscription_service_item_id`,
          )
          .innerJoin(
            `${schemaName}.${tableName}`,
            `${tableName}.id`,
            `${subscriptionServiceItemTable}.subscription_id`,
          )

          .where(
            `${subscriptionOrderTable}.id`,
            this.knex.raw('??', [`${subscriptionOrderTable}.id`]),
          )
          .whereIn(`${subscriptionOrderTable}.status`, [
            SUBSCRIPTION_ORDER_STATUS.finalized,
            SUBSCRIPTION_ORDER_STATUS.canceled,
          ])
          .groupBy([
            `${subscriptionOrderTable}.subscription_service_item_id`,
            `${subscriptionOrderTable}.price`,
            `${subscriptionOrderTable}.quantity`,
            `${subscriptionOrderTable}.id`,
            `${subscriptionOrderTable}.service_date`,
            `${tableName}.job_site_id`,

            `${billableServiceCTE}.description`,
            `${billableServiceCTE}.action`,

            `${subscriptionOrderTable}.subscription_service_item_id`,
          ]);
      })
      .with(subsWorkOrdersCTE, qb => {
        qb.select('id', 'status', 'service_date', 'subscription_order_id')
          .from(`${schemaName}.${subscriptionWorkOrderTable}`)
          .orderBy(`${subscriptionWorkOrderTable}.id`);
      })
      .with(lineItemsCTE, qb => {
        qb.select(
          `${subscriptionLineItemHt}.original_id as line_item_id`,
          `${subscriptionLineItemHt}.price`,
          `${subscriptionLineItemHt}.quantity`,
          `${subscriptionLineItemHt}.effective_date`,
          `${subscriptionLineItemHt}.id`,

          `${subscriptionLineItemHt}.proration_effective_price`,
          `${subscriptionLineItemHt}.proration_effective_date`,

          `${billableLineItemCTE}.description`,

          `${subscriptionLineItemHt}.subscription_service_item_id`,
        )
          .from(`${schemaName}.${subscriptionLineItemHt}`)

          // just not work with them
          .whereNot(`${subscriptionLineItemHt}.price`, 0)
          .whereNot(`${subscriptionLineItemHt}.quantity`, 0)

          .distinctOn([
            `${subscriptionLineItemHt}.effective_date`,
            `${subscriptionLineItemHt}.original_id`,
          ])

          .innerJoin(
            billableLineItemCTE,
            `${billableLineItemCTE}.id`,
            `${subscriptionLineItemHt}.billable_line_item_id`,
          )

          .groupBy([
            `${subscriptionLineItemHt}.id`,

            `${billableLineItemCTE}.description`,

            `${subscriptionLineItemHt}.original_id`,
            `${subscriptionLineItemHt}.price`,
            `${subscriptionLineItemHt}.quantity`,
            `${subscriptionLineItemHt}.effective_date`,
            `${subscriptionLineItemHt}.subscription_service_item_id`,
          ])
          .orderBy([
            `${subscriptionLineItemHt}.effective_date`,
            `${subscriptionLineItemHt}.original_id`,
          ]);
      })
      .with(serviceItemsCTE, qb => {
        qb.select(
          // `${subscriptionServiceItemHt}.*`,
          'original_id as service_item_id',
          `${subscriptionServiceItemHt}.effective_date`,
          `${subscriptionServiceItemHt}.price`,
          `${subscriptionServiceItemHt}.quantity`,
          `${subscriptionServiceItemHt}.subscription_id`,
          `${subscriptionServiceItemHt}.service_days_of_week`,

          `${subscriptionServiceItemHt}.proration_effective_price`,
          `${subscriptionServiceItemHt}.proration_effective_date`,

          `${billableServiceCTE}.proration_type`,
          `${billableServiceCTE}.description`,

          this.knex.raw(
            `COALESCE(
                            json_agg(distinct  ${lineItemsCTE}.*)
                            FILTER (WHERE ${lineItemsCTE}.id IS NOT NULL),
                         '[]'
                         ) as line_items`,
          ),
          this.knex.raw(
            `COALESCE(
                            jsonb_agg(distinct ${subsOrdersCTE}.*)
                            FILTER (WHERE ${subsOrdersCTE}.id IS NOT NULL),
                         '[]'
                         ) as subscription_orders`,
          ),
        )
          .from(`${schemaName}.${subscriptionServiceItemHt}`)

          .distinctOn([
            `${subscriptionServiceItemHt}.effective_date`,
            `${subscriptionServiceItemHt}.original_id`,
          ])

          .innerJoin(
            billableServiceCTE,
            `${billableServiceCTE}.id`,
            `${subscriptionServiceItemHt}.billable_service_id`,
          )
          .leftJoin(
            lineItemsCTE,
            `${lineItemsCTE}.subscription_service_item_id`,
            `${subscriptionServiceItemHt}.original_id`,
          )
          .leftJoin(
            `${subsOrdersCTE}`,
            `${subsOrdersCTE}.subscription_service_item_id`,
            `${subscriptionServiceItemHt}.original_id`,
          )
          .groupBy([
            `${subscriptionServiceItemHt}.id`,

            `${billableServiceCTE}.proration_type`,
            `${billableServiceCTE}.description`,

            `${subsOrdersCTE}.subscription_service_item_id`,
          ])
          .orderBy([
            `${subscriptionServiceItemHt}.effective_date`,
            `${subscriptionServiceItemHt}.original_id`,
          ]);
      })

      .with(subscriptionCTE, qb => {
        qb.select(
          ...subscriptionFields,

          `${customersTable}.id as customer_original_id`,

          this.knex.raw(`jsonb_agg(${serviceItemsCTE}) as ??`, ['serviceItems']),
          this.knex.raw(
            `
                        jsonb_build_object(
                            'id', ${jobSiteCTE}.original_id,
                            'full_address', ${jobSiteCTE}.full_address,
                            'address_line_1', ${jobSiteCTE}.address_line_1,
                            'address_line_2', ${jobSiteCTE}.address_line_2,
                            'state', ${jobSiteCTE}.state,
                            'city', ${jobSiteCTE}.city,

                            'zip', ${jobSiteCTE}.zip

                        ) as ??
                    `,
            ['jobSiteAddress'],
          ),
        )
          .from(`${schemaName}.${tableName}`)
          .where(`${tableName}.business_unit_id`, businessUnitId)

          .whereIn(`${tableName}.status`, [SUBSCRIPTION_STATUS.active, SUBSCRIPTION_STATUS.closed])

          .groupBy([
            `${TABLE_NAME}.id`,
            `${jobSiteCTE}.id`,
            `${jobSiteCTE}.original_id`,
            `${jobSiteCTE}.full_address`,
            `${jobSiteCTE}.address_line_1`,
            `${jobSiteCTE}.address_line_2`,
            `${jobSiteCTE}.state`,
            `${jobSiteCTE}.zip`,
            `${jobSiteCTE}.city`,
            `${customersTable}.id`,
          ])

          .innerJoin(jobSiteCTE, `${jobSiteCTE}.id`, `${tableName}.jobSiteId`)
          .innerJoin(serviceItemsCTE, `${serviceItemsCTE}.subscription_id`, `${TABLE_NAME}.id`)
          .innerJoin(`${schemaName}.${customersHT}`, `${customersHT}.id`, `${tableName}.customerId`)
          .innerJoin(
            `${schemaName}.${customersTable}`,
            `${customersTable}.id`,
            `${customersHT}.originalId`,
          )

          .leftJoin(
            `${schemaName}.${subscriptionOrderTable}`,
            `${serviceItemsCTE}.service_item_id`,
            `${subscriptionOrderTable}.subscription_service_item_id`,
          );

        // eslint-disable-next-line no-param-reassign
        qb = this.addFiltersToQuery(qb, condition);
      })
      .with(unfinalizedSubsOrdersCTE, qb => {
        qb.distinct(
          this.knex.raw(`
                        COUNT(${subsOrdersCTE}.id)
                        OVER(PARTITION BY ${subscriptionCTE}.customer_original_id)
                        AS orders_count
                    `),
          this.knex.raw(`
                        SUM(${subsOrdersCTE}.grand_total)
                        OVER(PARTITION BY ${subscriptionCTE}.customer_original_id)
                        AS orders_total
                    `),
          `${subscriptionCTE}.id AS subscription_id`,
          `${subscriptionCTE}.customer_original_id AS customer_id`,
          `${subsOrdersCTE}.grand_total AS grand_total`,
          `${subsOrdersCTE}.id AS order_id`,
          `${subsOrdersCTE}.service_date AS service_date`,
          `${subsOrdersCTE}.status AS status`,
          `${subsOrdersCTE}.job_site_id AS job_site_id`,
        )
          .from(subsOrdersCTE)
          .innerJoin(
            `${serviceItemsCTE}`,
            `${serviceItemsCTE}.service_item_id`,
            `${subsOrdersCTE}.subscription_service_item_id`,
          )
          .innerJoin(
            `${subscriptionCTE}`,
            `${subscriptionCTE}.id`,
            `${serviceItemsCTE}.subscription_id`,
          )
          .innerJoin(
            `${subsWorkOrdersCTE}`,
            `${subsWorkOrdersCTE}.subscription_order_id`,
            `${subsOrdersCTE}.id`,
          )
          .whereNotIn(`${subsWorkOrdersCTE}.status`, [
            SUBSCRIPTION_WO_STATUS.completed,
            SUBSCRIPTION_WO_STATUS.canceled,
            SUBSCRIPTION_WO_STATUS.blocked,
          ])
          .andWhere(outerBuilder => {
            outerBuilder
              .where(firstConditionBuilder => {
                firstConditionBuilder
                  .where(`${subscriptionCTE}.billing_type`, BILLING_TYPES.inAdvance)
                  .where(
                    this.knex.ref(`${subsWorkOrdersCTE}.service_date`),
                    '<',
                    this.knex.ref(`${subscriptionCTE}.next_billing_period_from`),
                  );
              })
              .orWhere(secondConditionBuilder => {
                secondConditionBuilder
                  .where(`${subscriptionCTE}.billing_type`, BILLING_TYPES.arrears)
                  .where(
                    this.knex.ref(`${subsWorkOrdersCTE}.service_date`),
                    '<',
                    this.knex.ref(`${subscriptionCTE}.next_billing_period_to`),
                  );
              });
          })
          .groupBy([
            `${subscriptionCTE}.id`,
            `${subscriptionCTE}.customer_original_id`,
            `${subsOrdersCTE}.id`,
            `${subsOrdersCTE}.grand_total`,
            `${subsOrdersCTE}.service_date`,
            `${subsOrdersCTE}.status`,
            `${subsOrdersCTE}.job_site_id`,
          ])
          .orderBy([`${subscriptionCTE}.id`, `${subsOrdersCTE}.id`]);
      });
    return query;
  }

  async getStateBeforeInvoiced(subIds) {
    let response = [];
    if (!subIds?.length) {
      return response;
    }

    // pre-pricing service code:
    // const subscriptionFields = [
    //   'id',
    //   'next_billing_period_from',
    //   'next_billing_period_to',
    //   'invoiced_date',
    // ];
    // end pre-pricing service code
    const subscriptions = await pricingGetSubscriptionsToInvoice(this.getCtx(), {
      data: { subIds },
    });

    response = subscriptions?.length > 0 ? subscriptions : [];

    // pre-pricing service code:
    // const selects = [
    //   ...subscriptionFields.map(field => `${this.tableName}.${field}`),
    //   trx.raw(
    //     `
    //             array_agg(
    //             distinct jsonb_build_object(
    //                 'id', ${lineItemTable}.id,
    //                 'invoicedDate', ${lineItemTable}.invoiced_date
    //                 )

    //             ) as ??
    //             `,
    //     ['subscriptionLineItems'],
    //   ),
    //   trx.raw(
    //     `
    //             array_agg(
    //             distinct jsonb_build_object(
    //                 'id', ${subOrder}.id,
    //                 'invoicedDate', ${subOrder}.invoiced_date,
    //                 'status', ${subOrder}.status
    //                 )

    //             ) as ??
    //             `,
    //     ['subscriptionOrderItems'],
    //   ),

    //   trx.raw(
    //     `
    //             json_agg(
    //                 distinct jsonb_build_object(
    //                         'id', ${serviceItemTable}.id,
    //                         'invoicedDate', ${serviceItemTable}.invoiced_date
    //                     )
    //                 ) as ??
    //             `,
    //     ['subscriptionServiceItem'],
    //   ),
    // ];

    // const beforeInvoiced = await trx(this.tableName)
    //   .withSchema(this.schemaName)
    //   .innerJoin(serviceItemTable, `${this.tableName}.id`, `${serviceItemTable}.subscriptionId`)
    //   .leftJoin(
    //     lineItemTable,
    //     `${serviceItemTable}.id`,
    //     `${lineItemTable}.subscriptionServiceItemId`,
    //   )

    //   .leftJoin(subOrder, `${serviceItemTable}.id`, `${subOrder}.subscriptionServiceItemId`)

    //   .groupBy(`${this.tableName}.id`)

    //   .whereIn(`${this.tableName}.id`, subscriptionIds)
    //   .select(selects);

    // return beforeInvoiced;
    // end pre-pricing service code
    return response;
  }

  async getSumCurrentSubscriptionPrice(
    { condition: { customerId, ...condition } } = {},
    trx = this.knex,
  ) {
    condition.status = SUBSCRIPTION_STATUS.active;

    const customerHT = CustomerRepo.getHistoricalTableName();
    const { sumCurrentSubscriptionPrice } = await trx(this.tableName)
      .withSchema(this.schemaName)
      .sum({ sumCurrentSubscriptionPrice: 'recurringGrandTotal' })
      .innerJoin(customerHT, `${customerHT}.id`, `${this.tableName}.customerId`)
      .where(unambiguousCondition(this.tableName, condition))
      .andWhere(`${customerHT}.originalId`, customerId)
      .whereNull(`${this.tableName}.invoicedDate`)
      .first();

    return Number(sumCurrentSubscriptionPrice) || 0;
  }

  async getSumPaid({ condition: { customerId, ...condition } } = {}, trx = this.knex) {
    const customerHT = CustomerRepo.getHistoricalTableName();
    const { subsTotalPaid } = await trx(this.tableName)
      .withSchema(this.schemaName)
      .sum({ subsTotalPaid: 'paidTotal' })
      .innerJoin(customerHT, `${customerHT}.id`, `${this.tableName}.customerId`)
      .where(unambiguousCondition(this.tableName, condition))
      .andWhere(`${customerHT}.originalId`, customerId)
      .first();

    return Number(subsTotalPaid) || 0;
  }

  async getSubscriptionsToNotifyHold({ fields = ['*'] }) {
    const customerTable = CustomerRepo.TABLE_NAME;
    const customerHT = CustomerRepo.getHistoricalTableName();
    const contactTable = ContactRepo.TABLE_NAME;
    const customerGroupTable = CustomerGroupRepository.TABLE_NAME;
    const selects = [
      ...unambiguousSelect(this.tableName, fields),
      ...unambiguousSelect(customerTable, [
        'salesId',
        'contactId',
        'email',
        'firstName',
        'lastName',
      ]),
      `${customerTable}.id as customerId`,
      `${contactTable}.email as mainEmail`,
      `${contactTable}.firstName as mainFirstName`,
      `${contactTable}.lastName as mainLastName`,
      `${customerGroupTable}.type as customerType`,
    ];

    const result = await this.knex(this.tableName)
      .withSchema(this.schemaName)
      .where({ onHoldEmailSent: false })
      .andWhere(qb => {
        qb.whereNotNull(`${customerTable}.salesId`)
          .andWhere(`${this.tableName}.onHoldNotifySalesRep`, true)
          .orWhere(`${this.tableName}.onHoldNotifyMainContact`, true);
      })
      .select(selects)
      .innerJoin(customerHT, `${customerHT}.id`, `${this.tableName}.customerId`)
      .innerJoin(customerTable, `${customerTable}.id`, `${customerHT}.originalId`)
      .innerJoin(contactTable, `${customerTable}.contactId`, `${contactTable}.id`)
      .innerJoin(
        customerGroupTable,
        `${customerTable}.customerGroupId`,
        `${customerGroupTable}.id`,
      );

    return result || [];
  }

  async setSubscriptionHoldSent(subscriptionIds) {
    await this.knex(this.tableName)
      .withSchema(this.schemaName)
      .update({ onHoldEmailSent: true })
      .whereIn(`${this.tableName}.id`, subscriptionIds);
  }
  async filterBySearchQuery({ condition: { searchQuery } = {} } = {}, trx = this.knex) {
    const jobsiteHT = JobSiteRepo.getHistoricalTableName();
    const customerHT = CustomerRepo.getHistoricalTableName();

    const concatJobSite = trx.raw(
      `CONCAT(${jobsiteHT}.address_line_1,${jobsiteHT}.address_line_2,${jobsiteHT}.city,${jobsiteHT}.state,${jobsiteHT}.zip)`,
    );
    const concatCustomer = trx.raw(
      `CONCAT(${customerHT}.business_name,${customerHT}.first_name,${customerHT}.last_name)`,
    );

    const subQueryJobSite = trx(jobsiteHT)
      .withSchema(this.schemaName)
      .select('id', 'originalId')
      .orderBy('id', 'desc')
      .where(concatJobSite, 'ilike', `%${searchQuery}%`)
      .as('subquery');

    const subQueryCustomer = trx(customerHT)
      .withSchema(this.schemaName)
      .select('id', 'originalId')
      .orderBy('id', 'desc')
      .where(concatCustomer, 'ilike', `%${searchQuery}%`)
      .as('subquery');

    const idsJobSites = await trx(jobsiteHT).from(subQueryJobSite).distinctOn('originalId');
    const idsCustomer = await trx(customerHT).from(subQueryCustomer).distinctOn('originalId');
    return {
      jobSites: idsJobSites?.map(x => x.id) || [],
      customer: idsCustomer?.map(x => x.originalId) || [],
    };
  }
}

SubscriptionsRepository.TABLE_NAME = TABLE_NAME;

export default SubscriptionsRepository;
