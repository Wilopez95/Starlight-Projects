import pick from 'lodash/pick.js';
import isEmpty from 'lodash/isEmpty.js';
import groupBy from 'lodash/groupBy.js';
import omit from 'lodash/omit.js';
import { endOfToday, startOfToday } from 'date-fns';
import compose from 'lodash/fp/compose.js';

import { calculateRateValue } from '../services/batchRates.js';
import MqSender from '../services/amqp/sender.js';
import { AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES } from '../config.js';
import { compareDateAsc } from '../utils/dateTime.js';
import isNilOrNaN from '../utils/isNilOrNumeric.js';
import { unambiguousCondition } from '../utils/dbHelpers.js';
import RatesRepository from './_rates.js';
import GlobalRatesServiceRepo from './globalRatesService.js';
import BillableServiceFrequencyRepo from './billableServiceFrequency.js';
import CustomRatesRecurrServiceFrequencyRepo from './customRatesGroupRecurringServiceFrequency.js';
import CustomRatesGroupRepo from './customRatesGroup.js';
import BillableServiceRepo from './billableService.js';
import EquipmentItemRepo from './equipmentItem.js';
import MaterialRepo from './material.js';

const mqSender = MqSender.getInstance();

const TABLE_NAME = 'custom_rates_group_services';

const mapOmitId = items => items.map(i => omit(i, ['id']));

class CustomRatesGroupServiceRepository extends RatesRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertOnConflict = `
            business_unit_id,
            business_line_id,
            custom_rates_group_id,
            billable_service_id,
            coalesce(material_id, '-1'::integer),
            equipment_item_id
        `;
    this.upsertConstraints = [
      'businessUnitId',
      'businessLineId',
      'customRatesGroupId',
      'billableServiceId',
      'materialId',
      'equipmentItemId',
    ];
  }

  async getRatesForUpsert({ serviceRates, serviceFrqRepo, trx }, { frequencies, ...data }) {
    const { billableServiceId } = data;
    const recurringServiceRates = await serviceFrqRepo.getByBillableServiceId(
      {
        condition: { billableServiceId },
        fields: ['id', 'billableServiceId'],
        nestedFields: ['times', 'type'],
      },
      trx,
    );

    return (
      recurringServiceRates
        ?.filter(frequency =>
          frequencies.some(rateFrequency => {
            let isSame = rateFrequency.type === frequency.type;

            if (isSame && rateFrequency.times) {
              isSame = rateFrequency.times === frequency.times;
              isSame = isSame && frequency.billableServiceId === billableServiceId;
            }

            if (isSame) {
              const rateId = serviceRates.find(
                rate =>
                  billableServiceId === rate.billableServiceId &&
                  data.equipmentItemId === rate.equipmentItemId &&
                  data.materialId === rate.materialId,
              )?.id;

              frequency.customRatesGroupRecurringServiceId = rateId;
              frequency.price = rateFrequency.price;
              frequency.billingCycle = rateFrequency.billingCycle;
            }

            return isSame;
          }),
        )
        .map(
          ({
            price,
            customRatesGroupRecurringServiceId,
            id: billableServiceFrequencyId,
            billingCycle,
          }) => ({
            price,
            customRatesGroupRecurringServiceId,
            billableServiceFrequencyId,
            billingCycle,
          }),
        ) ?? []
    );
  }

  async upsertMany({
    condition: { customRatesGroupId } = {},
    data: serviceRatesData,
    duplicate,
    constraints,
    concurrentData,
    log,
  }) {
    this.ctxState.logger.debug(
      `customRatesGroupServiceRepo->upsertMany->customRatesGroupId: ${customRatesGroupId}`,
    );
    this.ctxState.logger.debug(
      serviceRatesData,
      'customRatesGroupServiceRepo->upsertMany->serviceRatesData',
    );
    const itemsToRemove = [];
    const inputData = mapOmitId(serviceRatesData);
    // pre-pricing service refactor code:
    // const data = inputData.filter(item => {
    //   if (customRatesGroupId) {
    //     item.customRatesGroupId = customRatesGroupId;
    //   }
    //   if (isNilOrNaN(item.price) && !item.frequencies) {
    //     itemsToRemove.push(pick(item, this.constraints));
    //     return false;
    //   }
    // end of pre-pricing service refactor code
    // start of post-pricing service refactor code
    const data = inputData
      .filter(item => {
        if (customRatesGroupId) {
          item.customRatesGroupId = customRatesGroupId;
        }
        if (isNilOrNaN(item.price) && !item.frequencies) {
          itemsToRemove.push(pick(item, this.constraints));
          return false;
        }
        // end of post-pricing service refactor code

        return true;
      })
      .map(item => {
        if (!item.price) {
          item.price = 0;
        }
        return item;
      });
    this.ctxState.logger.debug(data, 'customRatesGroupServiceRepo->upsertMany->data');
    this.ctxState.logger.debug(
      itemsToRemove,
      'customRatesGroupServiceRepo->upsertMany->itemsToRemove',
    );

    const serviceFrqRepo = BillableServiceFrequencyRepo.getInstance(this.ctxState);
    const customRatesRecurrServiceFrequencyRepo = CustomRatesRecurrServiceFrequencyRepo.getInstance(
      this.ctxState,
    );

    const trx = await this.knex.transaction();
    try {
      if (data?.length) {
        const allServices = data.map(el => omit(el, ['frequencies', 'billingCycle']));
        this.ctxState.logger.debug(
          allServices,
          'customRatesGroupServiceRepo->upsertMany->allServices',
        );
        const serviceRates = await super.upsertMany(
          {
            data: allServices,
            concurrentData,
            constraints,
            log,
          },
          trx,
        );
        this.ctxState.logger.debug(
          serviceRates,
          'customRatesGroupServiceRepo->upsertMany->serviceRates',
        );

        const inputObj = {
          serviceFrqRepo,
          serviceRates,
          trx,
        };

        // on duplicate incoming data has no frequencies
        // so we need to create new custom price group billable services frequency relations
        if (duplicate) {
          const customRatesServicesFrequenciesRelations = await Promise.all(
            serviceRatesData.map(async ({ id }, idx) => {
              const freqRelation = await customRatesRecurrServiceFrequencyRepo.getAll(
                {
                  condition: { customRatesGroupRecurringServiceId: id },
                },
                trx,
              );

              if (!freqRelation?.length) {
                return null;
              }

              return freqRelation.map(freq => ({
                ...freq,
                customRatesGroupRecurringServiceId: serviceRates[idx].id,
              }));
            }),
          );
          this.ctxState.logger.debug(
            customRatesServicesFrequenciesRelations,
            'customRatesGroupServiceRepo->upsertMany->customRatesServicesFrequenciesRelations',
          );

          const existingRelations = mapOmitId(
            (customRatesServicesFrequenciesRelations || []).flat().filter(Boolean),
          );

          if (existingRelations?.length) {
            customRatesRecurrServiceFrequencyRepo.insertMany({
              data: existingRelations,
            });
          }
        }

        const recurringServiceRates = await Promise.all(
          // TODO: refactor this garbage
          data
            .filter(({ frequencies }) => !isEmpty(frequencies))
            .map(this.getRatesForUpsert.bind(this, inputObj)),
        );
        this.ctxState.logger.debug(
          recurringServiceRates,
          'customRatesGroupServiceRepo->upsertMany->recurringServiceRates',
        );

        if (recurringServiceRates?.length) {
          const ratesToRemove = [];
          const ratesToUpsert = recurringServiceRates.flat().filter(frequency => {
            if (!frequency) {
              return false;
            }
            if (frequency.price === null) {
              ratesToRemove.push({
                customRatesGroupRecurringServiceId: frequency.customRatesGroupRecurringServiceId,
                billableServiceFrequencyId: frequency.billableServiceFrequencyId,
                billingCycle: frequency.billingCycle,
              });
              return false;
            }
            return true;
          });
          this.ctxState.logger.debug(
            ratesToUpsert,
            'customRatesGroupServiceRepo->upsertMany->ratesToUpsert',
          );
          this.ctxState.logger.debug(
            ratesToRemove,
            'customRatesGroupServiceRepo->upsertMany->ratesToRemove',
          );

          if (ratesToRemove?.length) {
            await Promise.all(
              ratesToRemove.map(condition =>
                CustomRatesRecurrServiceFrequencyRepo.getInstance(this.ctxState).deleteBy(
                  { condition },
                  trx,
                ),
              ),
            );
          }

          if (ratesToUpsert?.length) {
            await Promise.all([
              customRatesRecurrServiceFrequencyRepo.upsertMany({ data: ratesToUpsert }, trx),
              mqSender.sendTo(this.getCtx(), AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_BY_RATES_CHANGES, {
                customServiceRates: ratesToUpsert,
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

  getUpdatedServiceRates({ globalRates, customRates, data }) {
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
            rate.billableServiceId === globalRate.billableServiceId &&
            rate.materialId === globalRate.materialId &&
            rate.equipmentItemId === globalRate.equipmentItemId,
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
              price: newPrice,
              billableServiceId: globalRate.billableServiceId,
              materialId: globalRate.materialId,
              equipmentItemId: globalRate.equipmentItemId,
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
      serviceIds,
      materialIds,
      equipmentItemIds,
      updateNoneMaterialRates,
      log,
      checkPendingUpdates,
      overrideUpdates,
      ...data
    },
    trx,
  ) {
    this.ctxState.logger.debug(
      serviceIds,
      'customRatesGroupServiceRepo->batchRatesUpdate->serviceIds',
    );
    this.ctxState.logger.debug(
      materialIds,
      'customRatesGroupServiceRepo->batchRatesUpdate->materialIds',
    );
    this.ctxState.logger.debug(
      equipmentItemIds,
      'customRatesGroupServiceRepo->batchRatesUpdate->equipmentItemIds',
    );
    this.ctxState.logger.debug(
      `customRatesGroupServiceRepo->batchRatesUpdate->updateNoneMaterialRates: ${updateNoneMaterialRates}`,
    );
    this.ctxState.logger.debug(data, 'customRatesGroupServiceRepo->batchRatesUpdate->data');
    const _trx = trx || (await this.knex.transaction());

    try {
      const globalRatesQuery = _trx(GlobalRatesServiceRepo.TABLE_NAME)
        .withSchema(this.schemaName)
        .whereIn('billableServiceId', serviceIds)
        .whereIn('equipmentItemId', equipmentItemIds)
        .where('businessUnitId', data.businessUnitId)
        .andWhere(qb => {
          qb.whereIn('materialId', materialIds);

          if (updateNoneMaterialRates) {
            qb.orWhereNull('materialId');
          }

          return qb;
        });
      const customRatesQuery = _trx(this.tableName)
        .withSchema(this.schemaName)
        .whereIn('billableServiceId', serviceIds)
        .whereIn('equipmentItemId', equipmentItemIds)
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

      this.ctxState.logger.debug(
        `customRatesGroupServiceRepo->batchRatesUpdate->globalRatesQuery: ${globalRatesQuery.toString()}`,
      );
      this.ctxState.logger.debug(
        `customRatesGroupServiceRepo->batchRatesUpdate->customRatesQuery: ${customRatesQuery.toString()}`,
      );
      const [globalRates, customRates] = await Promise.all([globalRatesQuery, customRatesQuery]);
      this.ctxState.logger.debug(
        globalRates,
        'customRatesGroupServiceRepo->batchRatesUpdate->globalRates',
      );
      this.ctxState.logger.debug(
        customRates,
        'customRatesGroupServiceRepo->batchRatesUpdate->customRates',
      );

      if (globalRates?.length) {
        const updates = this.getUpdatedServiceRates({
          globalRates,
          customRates,
          overrideUpdates,
          data,
        });
        this.ctxState.logger.debug(
          updates,
          'customRatesGroupServiceRepo->batchRatesUpdate->updates',
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

    jtName = BillableServiceRepo.TABLE_NAME;
    joinedTableColumns = await BillableServiceRepo.getColumnsToSelect({
      alias: 'billableService',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    selects.push(...joinedTableColumns);
    query = query.innerJoin(jtName, `${jtName}.id`, `${this.tableName}.billableServiceId`);

    jtName = EquipmentItemRepo.TABLE_NAME;
    joinedTableColumns = await EquipmentItemRepo.getColumnsToSelect({
      alias: 'equipment',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    selects.push(...joinedTableColumns);
    query = query.leftJoin(jtName, `${jtName}.id`, `${this.tableName}.equipmentItemId`);

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
    billableServiceId,
    materialId,
    specifiedDate,
  }) {
    const result = await this.knex(this.historicalTableName)
      .withSchema(this.schemaName)
      .first([
        'price',
        'originalId as customRatesGroupServicesId',
        this.knex.raw(`coalesce(effective_date, created_at)::timestamp as effective_date`),
      ])
      .where({
        businessUnitId,
        businessLineId,
        customRatesGroupId,
        billableServiceId,
        materialId,
      })
      .andWhereRaw(`coalesce(effective_date, created_at) <= ?`, [specifiedDate])
      .orderBy([
        { column: `${this.historicalTableName}.createdAt`, order: 'desc' },
        { column: 'effectiveDate', order: 'desc' },
      ]);

    return result;
  }

  async getSalesPointRates({ condition: { customRatesGroupIds, ...condition }, fields = '*' }) {
    const items = await this.knex(this.tableName)
      .withSchema(this.schemaName)
      .where(unambiguousCondition(this.tableName, condition))
      .select(fields)
      .innerJoin(
        BillableServiceRepo.TABLE_NAME,
        `${BillableServiceRepo.TABLE_NAME}.id`,
        `${this.tableName}.billable_service_id`,
      )
      .whereIn('customRatesGroupId', customRatesGroupIds)
      .andWhere(`${BillableServiceRepo.TABLE_NAME}.spUsed`, true)
      .andWhereRaw(
        `${BillableServiceRepo.TABLE_NAME}.equipment_item_id = ${this.tableName}.equipment_item_id`,
      )
      .whereNotNull(`${this.tableName}.materialId`)
      .andWhere(`${this.tableName}.price`, '>', 0);

    return items?.map(super.mapFields.bind(this)) ?? [];
  }
}

CustomRatesGroupServiceRepository.TABLE_NAME = TABLE_NAME;

export default CustomRatesGroupServiceRepository;
