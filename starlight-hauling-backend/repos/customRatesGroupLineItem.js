import pick from 'lodash/pick.js';
import isEmpty from 'lodash/isEmpty.js';
import groupBy from 'lodash/groupBy.js';
import omit from 'lodash/omit.js';
import compose from 'lodash/fp/compose.js';
import { endOfToday, startOfToday } from 'date-fns';

import { calculateRateValue } from '../services/batchRates.js';
import MqSender from '../services/amqp/sender.js';
import { compareDateAsc } from '../utils/dateTime.js';
import { unambiguousCondition } from '../utils/dbHelpers.js';
import isNilOrNaN from '../utils/isNilOrNumeric.js';
import { AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES } from '../config.js';
import RatesRepository from './_rates.js';
import GlobalRatesLineItemRepo from './globalRatesLineItem.js';
import BillableLineItemBillingCycleRepo from './billableLineItemBillingCycle.js';
import CustomRatesRecurrLineItemCycleRepo from './customRatesGroupRecurringLineItemBillingCycle.js';
import CustomRatesGroupRepo from './customRatesGroup.js';
import BillableLineItemRepo from './billableLineItem.js';
import MaterialRepo from './material.js';

const mqSender = MqSender.getInstance();

const TABLE_NAME = 'custom_rates_group_line_items';

class CustomRatesGroupLineItemRepository extends RatesRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertOnConflict = `
            business_unit_id,
            business_line_id,
            custom_rates_group_id,
            line_item_id,
            coalesce(material_id, '-1'::integer)
        `;
    this.upsertConstraints = [
      'businessUnitId',
      'businessLineId',
      'customRatesGroupId',
      'lineItemId',
      'materialId',
    ];
  }

  async getRatesForUpsert(
    { lineItemRates, lineItemCycleRepo, trx },
    { lineItemId, billingCycles },
  ) {
    const recurringLineItemRates = await lineItemCycleRepo.getBillingCyclesByLineItemId(
      {
        condition: { billableLineItemId: lineItemId },
        fields: ['id', 'billingCycle'],
      },
      trx,
    );

    return (
      recurringLineItemRates
        ?.filter(billingCycle =>
          billingCycles.some(rateCycle => {
            if (rateCycle.billingCycle === billingCycle.billingCycle) {
              billingCycle.price = rateCycle.price;
              return true;
            }
            return false;
          }),
        )
        .map(({ price, id }) => {
          const rateId = lineItemRates.find(rate => rate.lineItemId === lineItemId)?.id;
          if (rateId && id) {
            return {
              billableLineItemBillingCycleId: id,
              customRatesGroupRecurringLineItemId: rateId,
              price,
            };
          }
          return null;
        }) ?? []
    );
  }

  async upsertMany({
    condition: { customRatesGroupId } = {},
    data: inputData,
    constraints,
    concurrentData,
    log,
  }) {
    this.ctxState.logger.debug(inputData, 'customRatesGroupLineItemRepo->upsertMany->inputData');
    this.ctxState.logger.debug(
      `customRatesGroupLineItemRepo->upsertMany->customRatesGroupId: ${customRatesGroupId}`,
    );
    const itemsToRemove = [];
    // pre-pricing service refactor code:
    // const data = inputData.filter(item => {
    //   if (customRatesGroupId) {
    //     item.customRatesGroupId = customRatesGroupId;
    //   }
    //   if (!item.materialId) {
    //     item.materialId = null;
    //   }
    //   if (isNilOrNaN(item.price) && !item.billingCycles) {
    //     itemsToRemove.push(pick(item, this.constraints));
    //     return false;
    //   }
    //   if (!isEmpty(item.billingCycles)) {
    //     item.oneTime = false;
    //     item.materialId = null;
    //   }
    //   return true;
    // }, this);
    // end of pre-pricing service refactor code
    // added for pricing service refactor
    const data = inputData
      .filter(item => {
        if (customRatesGroupId) {
          item.customRatesGroupId = customRatesGroupId;
        }
        if (!item.materialId) {
          item.materialId = null;
        }
        if (isNilOrNaN(item.price) && !item.billingCycles) {
          itemsToRemove.push(pick(item, this.constraints));
          return false;
        }
        if (!isEmpty(item.billingCycles)) {
          item.oneTime = false;
          item.materialId = null;
        }
        return true;
      }, this)
      // end added code
      .map(item => {
        if (!item.price) {
          item.price = 0;
        }
        return item;
      });
    this.ctxState.logger.debug(data, 'customRatesGroupLineItemRepo->upsertMany->data');
    this.ctxState.logger.debug(
      itemsToRemove,
      'customRatesGroupLineItemRepo->upsertMany->itemsToRemove',
    );

    const lineItemCycleRepo = BillableLineItemBillingCycleRepo.getInstance(this.ctxState);
    const customRatesLineItemCycleRepo = CustomRatesRecurrLineItemCycleRepo.getInstance(
      this.ctxState,
    );

    const trx = await this.knex.transaction();

    try {
      if (data?.length) {
        const allLineItems = data.map(el => omit(el, 'billingCycles'));
        const lineItemRates = await super.upsertMany(
          {
            data: allLineItems,
            concurrentData,
            constraints,
            log,
          },
          trx,
        );

        const inputObj = {
          lineItemRates,
          lineItemCycleRepo,
          trx,
        };
        const recurringlineItemRates = await Promise.all(
          // TODO: refactor this garbage
          data
            .filter(({ billingCycles }) => !isEmpty(billingCycles))
            .map(this.getRatesForUpsert.bind(this, inputObj)),
        );
        this.ctxState.logger.debug(
          recurringlineItemRates,
          'customRatesGroupLineItemRepo->upsertMany->recurringlineItemRates',
        );

        if (recurringlineItemRates?.length) {
          const ratesToRemove = [];
          const itemsToUpsert = recurringlineItemRates.flat().filter(billingCycle => {
            if (!billingCycle) {
              return false;
            }
            if (billingCycle.price === null) {
              ratesToRemove.push(
                pick(billingCycle, [
                  'customRatesGroupRecurringLineItemId',
                  'billableLineItemBillingCycleId',
                ]),
              );
              return false;
            }
            return true;
          });
          this.ctxState.logger.debug(
            itemsToUpsert,
            'customRatesGroupLineItemRepo->upsertMany->itemsToUpsert',
          );
          this.ctxState.logger.debug(
            ratesToRemove,
            'customRatesGroupLineItemRepo->upsertMany->ratesToRemove',
          );

          if (ratesToRemove?.length) {
            await Promise.all(
              ratesToRemove.map(condition =>
                customRatesLineItemCycleRepo.deleteBy({ condition }, trx),
              ),
            );
          }

          if (itemsToUpsert?.length) {
            await Promise.all([
              customRatesLineItemCycleRepo.upsertMany({ data: itemsToUpsert }, trx),

              mqSender.sendTo(this.getCtx(), AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES, {
                customLineItemsRates: itemsToUpsert,
              }),
            ]);
          }
        }
      }

      if (itemsToRemove?.length) {
        await Promise.all(
          itemsToRemove.map(condition => this.deleteBy({ condition, log }, trx), this),
        );
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async getByRecurringLineItemIds(
    { condition = {}, ids = [], fields = ['*'] } = {},
    trx = this.knex,
  ) {
    const { customRatesGroupId, billingCycle, businessLineId, businessUnitId } = condition;
    const customRates = await trx(this.tableName)
      .withSchema(this.schemaName)
      .whereIn('lineItemId', ids)
      .andWhere({ customRatesGroupId, oneTime: false, businessLineId, businessUnitId })
      .select(fields);

    if (!customRates?.length) {
      return [];
    }

    const lineCycleRepo = BillableLineItemBillingCycleRepo.getInstance(this.ctxState);

    await Promise.all(
      customRates.map(async customRate => {
        const lineCyclesRates = await lineCycleRepo.getBillingCyclesByLineItemId(
          {
            condition: {
              billableLineItemId: customRate.lineItemId,
              customRatesGroupRecurringLineItemId: customRate.id,
              billingCycle,
            },
            fields: ['billingCycle'],
          },
          trx,
        );

        customRate.price = lineCyclesRates.price;
        customRate.id = lineCyclesRates.id;
      }),
    );

    return customRates;
  }

  async getAll({ condition } = {}, trx = this.knex) {
    const billableCyclesRatesT = CustomRatesRecurrLineItemCycleRepo.TABLE_NAME;
    const lineItemsCyclesT = BillableLineItemBillingCycleRepo.TABLE_NAME;
    const whereCondition = unambiguousCondition(this.tableName, condition);

    const selects = [
      `${this.tableName}.*`,
      trx.raw(
        `json_agg(
                    json_build_object(
                        'id', ${billableCyclesRatesT}.id,
                        'billingCycle', ${lineItemsCyclesT}.billing_cycle,
                        'price', ${billableCyclesRatesT}.price,
                        'effectiveDate', ${billableCyclesRatesT}.effective_date,
                        'nextPrice', ${billableCyclesRatesT}.next_price
                    )
                ) as billingCycles`,
      ),
    ];
    const query = trx(this.tableName)
      .withSchema(this.schemaName)
      .leftJoin(
        billableCyclesRatesT,
        `${billableCyclesRatesT}.customRatesGroupRecurringLineItemId`,
        `${this.tableName}.id`,
      )
      .leftJoin(
        lineItemsCyclesT,
        `${lineItemsCyclesT}.id`,
        `${billableCyclesRatesT}.billableLineItemBillingCycleId`,
      )
      .where(whereCondition)
      .select(selects)
      .groupBy(`${this.tableName}.id`)
      .orderBy(`${this.tableName}.id`);
    this.ctxState.logger.debug(`customRatesGroupLineItem->getAll->query: ${query.toString()}`);

    const items = await query;

    return (
      items
        ?.map(({ billingcycles, ...item }) => ({
          ...item,
          billingCycles: billingcycles?.filter(cycle => !!cycle.id) || [],
        }))
        .map(this.mapFields.bind(this)) ?? []
    );
  }

  getUpdatedLineItemRates({ globalRates, customRates, data }) {
    const {
      customRateGroupIds,
      businessLineId,
      businessUnitId,
      effectiveDate = null,
      overrideUpdates,
      ...restData
    } = data;
    const customRatesGroups = groupBy(customRates, 'customRatesGroupId');
    const today = endOfToday();
    const rowsToUpdate = [];

    globalRates.forEach(globalRate => {
      customRateGroupIds.map(groupId => {
        const customRate = customRatesGroups[groupId]?.find(
          rate =>
            rate.lineItemId === globalRate.lineItemId && rate.materialId === globalRate.materialId,
        );
        const newPrice = calculateRateValue({
          globalPrice: Number(globalRate.price),
          currentRate: !isNilOrNaN(customRate?.price) ? Number(customRate.price) : undefined,
          ...restData,
        });

        if (!Number.isNaN(newPrice)) {
          if (customRate) {
            if (!overrideUpdates && compareDateAsc(customRate.effectiveDate, today) === 1) {
              return groupId;
            }
            const isEffectiveDateGreater = compareDateAsc(effectiveDate, today) === 1;
            if (isEffectiveDateGreater) {
              customRate.nextPrice = newPrice;
              customRate.effectiveDate = effectiveDate;
            } else {
              customRate.price = newPrice;
              customRate.nextPrice = null;
              customRate.effectiveDate = today;
            }
            rowsToUpdate.push(customRate);
          } else {
            rowsToUpdate.push({
              businessLineId,
              businessUnitId,
              customRatesGroupId: groupId,
              materialId: globalRate.materialId,
              price: newPrice,
              lineItemId: globalRate.lineItemId,
            });
          }
        }

        return groupId;
      });
    });

    return rowsToUpdate;
  }

  async batchRatesUpdate(
    {
      lineItemIds,
      materialIds,
      updateNoneMaterialRates,
      log,
      checkPendingUpdates,
      overrideUpdates,
      ...data
    },
    trx,
  ) {
    this.ctxState.logger.debug(
      lineItemIds,
      'customRatesGroupLineItemRepo->batchRatesUpdate->lineItemIds',
    );
    this.ctxState.logger.debug(
      materialIds,
      'customRatesGroupLineItemRepo->batchRatesUpdate->materialIds',
    );
    this.ctxState.logger.debug(
      updateNoneMaterialRates,
      'customRatesGroupLineItemRepo->batchRatesUpdate->updateNoneMaterialRates',
    );
    this.ctxState.logger.debug(data, 'customRatesGroupLineItemRepo->batchRatesUpdate->data');

    const _trx = trx || (await this.knex.transaction());

    const globalRatesQuery = GlobalRatesLineItemRepo.getInstance(this.ctxState)
      .getByLineItemIds({ ids: lineItemIds }, _trx)
      .andWhere('businessUnitId', data.businessUnitId)
      .andWhere(qb => {
        qb.whereIn('materialId', materialIds);

        if (updateNoneMaterialRates) {
          qb.orWhereNull('materialId');
        }
        return qb;
      });

    const customRatesQuery = this.getByLineItemIds({ ids: lineItemIds }, _trx)
      .whereIn('customRatesGroupId', data.customRateGroupIds)
      .andWhere(qb => {
        qb.whereIn('materialId', materialIds);

        if (updateNoneMaterialRates) {
          qb.orWhereNull('materialId');
        }
        return qb;
      });

    if (checkPendingUpdates) {
      const pendingUpdates = await customRatesQuery.where(
        `${this.tableName}.effectiveDate`,
        '>',
        startOfToday(),
      );

      return pendingUpdates;
    }

    try {
      const [globalRates, customRates] = await Promise.all([globalRatesQuery, customRatesQuery]);
      this.ctxState.logger.debug(
        globalRates,
        'customRatesGroupLineItemRepo->batchRatesUpdate->globalRates',
      );
      this.ctxState.logger.debug(
        customRates,
        'customRatesGroupLineItemRepo->batchRatesUpdate->customRates',
      );

      if (globalRates?.length) {
        const updates = this.getUpdatedLineItemRates({
          globalRates,
          customRates,
          overrideUpdates,
          data,
        });
        this.ctxState.logger.debug(
          updates,
          'customRatesGroupLineItemRepo->batchRatesUpdate->updates',
        );

        if (updates?.length) {
          await this.upsertMany({ data: updates, log }, _trx);
        }
      }

      if (!trx) {
        await _trx.commit();
      }
      return null;
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }
  }

  getAllForPriceUpdateToday(trx = this.knex) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .select('*')
      .whereNotNull('nextPrice')
      .where('effectiveDate', '>=', startOfToday())
      .andWhere('effectiveDate', '<=', endOfToday());
  }

  async getByIdToLog(id, trx = this.knex) {
    let query = super.getByIdQuery(id, trx);

    let selects = [`${this.tableName}.*`];

    ({ query, selects } = await super.populateBuBl({ query, selects }));

    let jtName = CustomRatesGroupRepo.TABLE_NAME;
    let joinedTableColumns = await CustomRatesGroupRepo.getColumnsToSelect({
      alias: 'customRatesGroup',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    selects.push(...joinedTableColumns);
    query = query.innerJoin(jtName, `${jtName}.id`, `${this.tableName}.customRatesGroupId`);

    jtName = BillableLineItemRepo.TABLE_NAME;
    joinedTableColumns = await BillableLineItemRepo.getColumnsToSelect({
      alias: 'billableLineItem',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    selects.push(...joinedTableColumns);
    query = query.innerJoin(jtName, `${jtName}.id`, `${this.tableName}.lineItemId`);

    jtName = MaterialRepo.TABLE_NAME;
    joinedTableColumns = await MaterialRepo.getColumnsToSelect({
      alias: 'material',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    selects.push(...joinedTableColumns);
    query = query.leftJoin(jtName, `${jtName}.id`, `${this.tableName}.materialId`);

    const item = await query.select(selects);

    return item ? compose(super.mapJoinedFields, this.mapFields)(item) : null;
  }

  async getRateBySpecificDate({
    businessUnitId,
    businessLineId,
    customRatesGroupId,
    billableLineItemId: lineItemId,
    materialId,
    specifiedDate,
  }) {
    const result = await this.knex(this.historicalTableName)
      .withSchema(this.schemaName)
      .first([
        'price',
        'originalId as customRatesGroupLineItemsId',
        this.knex.raw(`coalesce(effective_date, created_at)::timestamp as effective_date`),
      ])
      .where({
        businessLineId,
        businessUnitId,
        customRatesGroupId,
        lineItemId,
        materialId,
      })
      .andWhereRaw(`coalesce(effective_date, created_at) <= ?`, [specifiedDate])
      .orderBy([
        { column: `${this.historicalTableName}.createdAt`, order: 'desc' },
        { column: 'effectiveDate', order: 'desc' },
      ]);

    return result;
  }
}

CustomRatesGroupLineItemRepository.TABLE_NAME = TABLE_NAME;

export default CustomRatesGroupLineItemRepository;
