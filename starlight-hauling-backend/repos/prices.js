import isEmpty from 'lodash/isEmpty.js';

import { unambiguousCondition, unambiguousSelect, resolveSelect } from '../utils/dbHelpers.js';
import { PRICE_ENTITY_TYPE, PRICE_ENTITY_TYPE_FOR_BATCH } from '../consts/priceEntityTypes.js';
import BaseRepository from './_base.js';
import PriceGroupRepo from './priceGroups.js';
import BillableServiceRepo from './billableService.js';
import FrequencyRepo from './frequency.js';

// import { priceFields } from '../consts/priceFields.js';

const TABLE_NAME = 'prices';
const UNIQUENESS_COLUMNS = [
  `priceGroupId`,
  `entityType`,
  `billableServiceId`,
  `billableLineItemId`,
  `equipmentItemId`,
  `materialId`,
  `thresholdId`,
  `surchargeId`,
  `billingCycle`,
  `frequencyId`,
];
const ALL_COLUMNS = [
  `id`,
  `priceGroupId`,
  `entityType`,
  `billableServiceId`,
  `billableLineItemId`,
  `equipmentItemId`,
  `materialId`,
  `thresholdId`,
  `surchargeId`,
  `billingCycle`,
  `frequencyId`,
  `price`,
  `nextPrice`,
  `startAt`,
  `endAt`,
  `createdAt`,
  `priceGroupId`,
  `userId`,
  `traceId`,
  `limit`,
  `user`,
];

class PriceRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  // will be needed after independent orders refactoring (code splitting, logic separation)
  getForGroupByDate({ condition: { date, entityType, ...condition } = {} }, trx = this.knex) {
    let query = super
      .getAll({ condition: {} }, trx)
      .andWhere(unambiguousCondition(this.tableName, condition))
      .andWhere('startAt', '<=', date)
      .andWhere(builder =>
        builder.whereNotNull('endAt').andWhere('endAt', '>', date).orWhereNull('endAt'),
      );

    if (entityType) {
      query = query.where(`${this.tableName}.entityType`, PRICE_ENTITY_TYPE[entityType]);
    }

    return query
      .orderBy(`${this.tableName}.id`, 'desc') // in case of re-defining price on the same day
      .first();
  }

  // will be needed after independent orders refactoring (code splitting, logic separation)
  getGeneralByDate(
    { condition: { date, entityType, ...condition }, priceGroupCondition = {}, fields = ['*'] },
    trx = this.knex,
  ) {
    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .where(`${this.tableName}.entityType`, PRICE_ENTITY_TYPE[entityType]);

    query = query
      .innerJoin(
        PriceGroupRepo.TABLE_NAME,
        `${this.tableName}.priceGroupId`,
        `${PriceGroupRepo.TABLE_NAME}.id`,
      )
      .where(`${PriceGroupRepo.TABLE_NAME}.isGeneral`, true)
      .andWhere(unambiguousCondition(this.tableName, condition));

    query = query
      .andWhere(`${this.tableName}.startAt`, '<=', date)
      .andWhere(builder =>
        builder
          .whereNotNull(`${this.tableName}.endAt`)
          .andWhere(`${this.tableName}.endAt`, '>', date)
          .orWhereNull(`${this.tableName}.endAt`),
      );

    if (!isEmpty(priceGroupCondition)) {
      query = query.where(unambiguousCondition(PriceGroupRepo.TABLE_NAME, priceGroupCondition));
    }

    return query
      .select(unambiguousSelect(this.tableName, fields))
      .orderBy(`${this.tableName}.id`, 'desc') // useful in case of re-defining price on the same day
      .first();
  }

  getAllRatesSubQuery(
    { condition: { date, entityType, isGeneral = true }, priceGroupCondition = {}, fields = ['*'] },
    trx,
  ) {
    let query = trx(this.tableName).withSchema(this.schemaName);

    const selects = unambiguousSelect(this.tableName, fields);

    query = query.select(selects);
    query = query.innerJoin(
      PriceGroupRepo.TABLE_NAME,
      `${this.tableName}.priceGroupId`,
      `${PriceGroupRepo.TABLE_NAME}.id`,
    );

    query = query
      .where(`${this.tableName}.entityType`, PRICE_ENTITY_TYPE[entityType])
      .where(`${PriceGroupRepo.TABLE_NAME}.isGeneral`, isGeneral);

    if (date) {
      query = query
        .andWhere(`${this.tableName}.startAt`, '<=', date)
        .andWhere(builder =>
          builder
            .whereNotNull(`${this.tableName}.endAt`)
            .andWhere(`${this.tableName}.endAt`, '>', date)
            .orWhereNull(`${this.tableName}.endAt`),
        );
    }

    if (!isEmpty(priceGroupCondition)) {
      query = query.where(unambiguousCondition(PriceGroupRepo.TABLE_NAME, priceGroupCondition));
    }
    query = query.orderBy(`${this.tableName}.id`, 'desc');

    this.ctxState.logger.debug(
      `priceRepo->getAllRatesAggregationSubQuery->query: ${query.toString()}`,
    );
    return query;
  }

  getAllRates(
    { condition: { date, entityType, isGeneral = true }, priceGroupCondition = {}, fields = ['*'] },
    trx = this.knex,
  ) {
    const alias = 'rates';
    const subQuery = this.getAllRatesSubQuery(
      { condition: { date, entityType, isGeneral }, priceGroupCondition, fields },
      trx,
    );
    let query = trx(subQuery.as(alias)).withSchema(this.schemaName);
    const selects = resolveSelect(
      {
        alias,
        // all columns are now aliased by subQuery alias
        fields: fields.map(field => {
          let column = field;
          if (field.includes('.')) {
            const parts = column.split('.');
            column = parts[parts.length - 1];
          }
          return column;
        }),
        allColumns: ALL_COLUMNS,
        uniquenessColumns: UNIQUENESS_COLUMNS,
        aggregatesSelector: 'first',
      },
      trx,
    );

    query = query.select(selects);

    query = query.groupBy(unambiguousSelect('rates', UNIQUENESS_COLUMNS));

    this.ctxState.logger.debug(`priceRepo->getAllRates->query: ${query.toString()}`);
    return query;
  }

  getAllByDate({ condition: { priceGroupId, date, entityType } = {} }, trx = this.knex) {
    let query = super
      .getAll({ condition: { priceGroupId } }, trx)
      .andWhere('startAt', '<=', date)
      .andWhere(builder =>
        builder.whereNotNull('endAt').andWhere('endAt', '>', date).orWhereNull('endAt'),
      );

    if (entityType) {
      query = query.where(`${this.tableName}.entityType`, PRICE_ENTITY_TYPE[entityType]);
    }

    return query;
  }

  getAllGeneral({ condition, priceGroupCondition = {}, fields = ['*'] }, trx = this.knex) {
    return this.getAllRates(
      { condition: { ...condition, isGeneral: true }, priceGroupCondition, fields },
      trx,
    );
  }

  getAllCustom({ condition, priceGroupCondition = {}, fields = ['*'] }, trx = this.knex) {
    return this.getAllRates(
      { condition: { ...condition, isGeneral: false }, priceGroupCondition, fields },
      trx,
    );
  }

  getAllForBatch(
    {
      condition: {
        entityType,
        servicesIds,
        materialIds,
        equipmentItemIds,
        lineItemIds,
        includeNonMaterial,
        today,
      },
      priceGroupCondition,
      isPreview = false,
      fields = ['*'],
    },
    trx = this.knex,
  ) {
    const priceGroupTable = PriceGroupRepo.TABLE_NAME;
    const frequencyTable = FrequencyRepo.TABLE_NAME;

    const condition = unambiguousCondition(PriceGroupRepo.TABLE_NAME, priceGroupCondition);

    if (entityType) {
      condition.entityType = entityType;
    }

    const selects = [...unambiguousSelect(this.tableName, fields), `${priceGroupTable}.isGeneral`];

    if (isPreview) {
      selects.push(
        `${frequencyTable}.type as frequencyType`,
        `${frequencyTable}.times as frequencyTimes`,
      );
    }

    let query = super
      .getAll({ condition, fields: selects }, trx)
      // remove when threshold and surcharge will be implemented
      .whereIn('entityType', PRICE_ENTITY_TYPE_FOR_BATCH)
      .andWhere(builder => {
        builder.whereIn('materialId', materialIds);

        if (includeNonMaterial) {
          builder.orWhereNull('materialId');
        }

        return builder;
      })
      .andWhere(builder =>
        builder
          .whereNotNull(`${this.tableName}.endAt`)
          .andWhere(`${this.tableName}.endAt`, '>', today)
          .orWhereNull(`${this.tableName}.endAt`),
      )
      .innerJoin(priceGroupTable, `${this.tableName}.priceGroupId`, `${priceGroupTable}.id`);

    if (isPreview) {
      query = query.leftJoin(
        frequencyTable,
        `${this.tableName}.frequencyId`,
        `${frequencyTable}.id`,
      );
    }

    if (servicesIds.length) {
      query = query.andWhere(builder => {
        builder
          .whereIn('billableServiceId', servicesIds)
          .whereIn(`${this.tableName}.equipmentItemId`, equipmentItemIds);

        if (lineItemIds.length) {
          builder.orWhereNull('billableServiceId').orWhereNull(`${this.tableName}.equipmentItemId`);
        }

        return builder;
      });
    }

    if (lineItemIds.length) {
      query = query.andWhere(builder => {
        builder.whereIn(`${this.tableName}.billableLineItemId`, lineItemIds);

        if (servicesIds.length) {
          builder.orWhereNull(`${this.tableName}.billableLineItemId`);
        }

        return builder;
      });
    }

    return query;
  }

  async updateMany({ data: dataArr, fields = ['*'] }, trx = this.knex) {
    const items = await Promise.all(
      dataArr.map(({ id, ...data }) =>
        super.updateBy(
          {
            condition: { id },
            data,
            fields,
            noUpdateAt: true,
          },
          trx,
        ),
      ),
    );

    return items;
  }

  getAllWithoutPlannedForBatchUpdate({ condition, orderBy, date }, trx = this.knex) {
    return super.getAll({ condition, orderBy }, trx).andWhere('startAt', '<', date);
  }

  getAllGeneralForSalesPoint(
    { condition, priceGroupCondition = {}, fields = ['*'] },
    trx = this.knex,
  ) {
    let query = this.getAllGeneral({ condition, priceGroupCondition, fields }, trx);

    query = query
      .innerJoin(
        BillableServiceRepo.TABLE_NAME,
        `${BillableServiceRepo.TABLE_NAME}.id`,
        `${this.tableName}.billable_service_id`,
      )
      .andWhere(`${BillableServiceRepo.TABLE_NAME}.spUsed`, true)
      .whereNotNull(`${this.tableName}.materialId`)
      .andWhere(`${this.tableName}.price`, '>', 0)
      .select(`${this.tableName}.equipmentItemId as dumpsterId`);

    return query;
  }

  getAllCustomForSalesPoint(
    { condition, priceGroupCondition = {}, fields = ['*'] },
    trx = this.knex,
  ) {
    let query = this.getAllCustom({ condition, priceGroupCondition, fields }, trx);

    query = query
      .innerJoin(
        BillableServiceRepo.TABLE_NAME,
        `${BillableServiceRepo.TABLE_NAME}.id`,
        `${this.tableName}.billable_service_id`,
      )
      .andWhere(`${BillableServiceRepo.TABLE_NAME}.spUsed`, true)
      .whereNotNull(`${this.tableName}.materialId`)
      .andWhere(`${this.tableName}.price`, '>', 0)
      .select([
        `${this.tableName}.equipmentItemId as dumpsterId`,
        `${PriceGroupRepo.TABLE_NAME}.service_areas_ids as service_areas_ids`,
      ]);

    query = query.whereRaw(`array_length(${PriceGroupRepo.TABLE_NAME}.service_areas_ids, 1) > 0`);

    return query;
  }
}

PriceRepository.TABLE_NAME = TABLE_NAME;

export default PriceRepository;
